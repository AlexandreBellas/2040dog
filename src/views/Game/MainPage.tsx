import {
  useBoard,
  useBoardDispatch,
  useBoardHelpers,
} from '@contexts/BoardContext'
import {
  useMultiplayer,
  useMultiplayerDispatch,
} from '@contexts/MultiplayerContext'
import {
  Box,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  CloseIcon,
  HStack,
  Heading,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ShareIcon,
  Spinner,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
import { IBoard } from '@interfaces/board'
import { IDirection } from '@interfaces/direction'
import BoardDatabaseService from '@services/database/board.database'
import PointsDatabaseService from '@services/database/points.database'
import { moveAnimationDuration } from '@utils/constants/animation'
import * as Clipboard from 'expo-clipboard'
import { throttle } from 'lodash'
import { Check } from 'lucide-react-native'
import { DataConnection } from 'peerjs'
import { useCallback, useEffect, useState } from 'react'
import { isBrowser, isMobile } from 'react-device-detect'
import { Alert, Platform } from 'react-native'
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler'

import Board from './Board'
import Tile from './Tile'
import Background from './components/Background'
import GameHeading from './components/GameHeading'
import RestartButton from './components/RestartButton'

interface IGestureData {
  [direction: string]: Directions
}

const gestureData: IGestureData = {
  up: Directions.UP,
  down: Directions.DOWN,
  left: Directions.LEFT,
  right: Directions.RIGHT,
} as const

export default function MainPage() {
  // #region Contexts
  const { createNewBoard, findGreatestTileValue } = useBoardHelpers()
  const { board, isGameOver, numOfMoves, hasWon, highestScore, currScore } =
    useBoard()
  const boardDispatch = useBoardDispatch()
  const {
    peerInstance,
    peerConnection,
    remotePlayerId,
    currPlayerId,
    remoteBoard,
    remoteIsGameOver,
    remoteHasWon,
  } = useMultiplayer()
  const multiplayerDispatch = useMultiplayerDispatch()
  // #endregion

  // #region States
  const [isConfiguringMultiplayer, setIsConfiguringMultiplayer] =
    useState(false)
  const [isConnectingToPlayer, setIsConnectingToPlayer] = useState(false)
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const [typeRemotePlayerId, setTypeRemotePlayerId] = useState('')
  const [hasConnectionError, setHasConnectionError] = useState(false)
  const [hasCopiedCurrId, setHasCopiedCurrId] = useState(false)
  // #endregion

  // #region Gestures
  const gestures = Object.entries(gestureData).map(
    ([direction, gestureDirection]) =>
      Gesture.Fling()
        .direction(gestureDirection)
        .numberOfPointers(1)
        .shouldCancelWhenOutside(true)
        .runOnJS(true)
        .onEnd(() => {
          move(direction as IDirection)
        }),
  )
  const moveGesture = Gesture.Race(...gestures)
  // #endregion

  // #region Callbacks
  const resetMultiplayerStatus = useCallback(
    (hasError: boolean) => {
      setIsMultiplayer(false)
      setIsConfiguringMultiplayer(false)
      setHasConnectionError(hasError)
      setIsConnectingToPlayer(false)

      peerConnection?.close()

      multiplayerDispatch({ type: 'remove-connection' })
      boardDispatch({ type: 'restart' })
    },
    [multiplayerDispatch, boardDispatch, peerConnection],
  )

  const multiplayerConfigure = useCallback(
    (peerConnection: DataConnection) => {
      // Open
      peerConnection.on('open', () => {
        console.log('connection open!', peerConnection)
        setHasConnectionError(false)
        setIsConnectingToPlayer(false)
        setIsMultiplayer(true)
        setHasCopiedCurrId(false)

        multiplayerDispatch({
          type: 'set-active-type',
          activeType: 'versus',
          remotePlayerId: peerConnection.peer,
          connection: peerConnection,
        })

        multiplayerDispatch({
          type: 'set-remote-board',
          board: createNewBoard(),
          isGameOver: false,
          hasWon: false,
        })

        boardDispatch({ type: 'restart' })

        setTimeout(() => {
          setIsConfiguringMultiplayer(false)
        }, 2000)
      })

      // Data
      peerConnection.on('data', (data) => {
        if (
          typeof data === 'object' &&
          data !== null &&
          'board' in data &&
          'isGameOver' in data &&
          'hasWon' in data
        ) {
          multiplayerDispatch({
            type: 'set-remote-board',
            board: data.board as IBoard,
            hasWon: data.hasWon as boolean,
            isGameOver: data.isGameOver as boolean,
          })
        }
      })

      // Error
      peerConnection.on('error', (error) => {
        console.log('connection errored!', error)

        if (Platform.OS === 'web') {
          alert('Connection error with peer.')
        } else {
          Alert.alert('Connection error', 'Connection had error with peer.')
        }

        resetMultiplayerStatus(true)
      })

      // Close
      peerConnection.on('close', () => {
        console.log('connection closed!')

        if (Platform.OS === 'web') {
          alert('Connection closed with peer.')
        } else {
          Alert.alert(
            'Connection closed',
            'Connection had been closed with peer.',
          )
        }

        resetMultiplayerStatus(false)
      })
    },
    [
      multiplayerDispatch,
      createNewBoard,
      boardDispatch,
      resetMultiplayerStatus,
    ],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const move = useCallback(
    throttle(
      (direction: IDirection) => {
        boardDispatch({ type: 'move', direction })
      },
      moveAnimationDuration * 1.05,
      { trailing: false },
    ),
    [boardDispatch],
  )

  function multiplayerConnectToPeer() {
    if (typeRemotePlayerId === currPlayerId) {
      setIsConnectingToPlayer(false)
      setHasConnectionError(true)
      return
    }

    const conn = peerInstance.connect(typeRemotePlayerId)

    if (conn === undefined) {
      if (Platform.OS === 'web') {
        alert(
          'It was not possible to connect to peer. Reload the page or check the provided ID.',
        )
      } else {
        Alert.alert(
          'Connection error',
          'It was not possible to connect to peer. Reload the app or check the provided ID.',
        )
      }

      resetMultiplayerStatus(true)
      return
    }

    multiplayerConfigure(conn)
  }
  // #endregion

  // #region Effects

  // onKeyboardMove
  useEffect(() => {
    if (Platform.OS !== 'web') return

    function keyDownHandler(e: KeyboardEvent) {
      const keyMap: Record<string, IDirection> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }

      const direction = keyMap[e.key]
      if (direction === undefined) return

      e.preventDefault()

      move(direction)
    }

    window.addEventListener('keydown', keyDownHandler)
    return () => window.removeEventListener('keydown', keyDownHandler)
  }, [move])

  // onAfterMove
  useEffect(() => {
    PointsDatabaseService.setCurrScore(currScore)
    PointsDatabaseService.setHighestScore(highestScore)

    if (!isMultiplayer) {
      BoardDatabaseService.save(board)
    }

    if (isGameOver) return
    setTimeout(() => {
      boardDispatch({ type: 'insert' })
    }, moveAnimationDuration)

    if (isMultiplayer && peerConnection) {
      peerConnection.send({ board, isGameOver, hasWon })
    }
  }, [
    board,
    boardDispatch,
    numOfMoves,
    isGameOver,
    peerConnection,
    isMultiplayer,
    hasWon,
    currScore,
    highestScore,
  ])

  // onEndGame
  useEffect(() => {
    if (isMultiplayer && remoteIsGameOver) {
      if (remoteHasWon) {
        if (Platform.OS === 'web') {
          alert('Oh no! You lost to your opponent 🥲🐶')
          peerConnection?.close()
          boardDispatch({ type: 'restart' })
          return
        }

        Alert.alert('Oh no!', 'You lost to your opponent 🥲🐶', [
          {
            text: 'Close',
            onPress: () => {
              setIsMultiplayer(false)
              peerConnection?.close()
              boardDispatch({ type: 'restart' })
            },
          },
        ])
        return
      }

      if (Platform.OS === 'web') {
        alert('Your opponent lost 😅.')

        setIsMultiplayer(false)
        peerConnection?.close()
        boardDispatch({ type: 'restart' })
        return
      }

      Alert.alert('Congratulations!', 'Your opponent lost 😅', [
        {
          text: 'Close',
          onPress: () => {
            setIsMultiplayer(false)
            peerConnection?.close()
            boardDispatch({ type: 'restart' })
          },
        },
      ])
      return
    }

    if (!isGameOver) return

    if (isMultiplayer) {
      peerConnection?.send({ board, hasWon, isGameOver })
      if (hasWon) {
        if (Platform.OS === 'web') {
          alert('Congratulations! You won your opponent 😎🐶')
          peerConnection?.close()
          boardDispatch({ type: 'restart' })
          return
        }

        Alert.alert('Congratulations!', 'You won your opponent 😎🐶', [
          {
            text: 'Yay!',
            onPress: () => {
              setIsMultiplayer(false)
              peerConnection?.close()
              boardDispatch({ type: 'restart' })
            },
          },
        ])
        return
      }

      if (Platform.OS === 'web') {
        alert('You lost 🥺.')

        setIsMultiplayer(false)
        peerConnection?.close()
        boardDispatch({ type: 'restart' })
        return
      }

      Alert.alert('You lost 🥺', 'Your opponent won.', [
        {
          text: 'Close',
          onPress: () => {
            setIsMultiplayer(false)
            peerConnection?.close()
            boardDispatch({ type: 'restart' })
          },
        },
      ])
      return
    }

    setTimeout(() => {
      if (hasWon) {
        if (Platform.OS === 'web') {
          setTimeout(() => {
            alert('Congratulations! ❤️ You deserve 2040 lickisses 🐶')
          }, 1000)
          return
        }

        Alert.alert('Congratulations! ❤️', 'You deserve 2040 lickisses 🐶', [
          {
            text: 'Yay!',
          },
          {
            text: 'Replay',
            onPress: () => {
              boardDispatch({ type: 'restart' })
            },
          },
        ])
        return
      }

      if (Platform.OS === 'web' && confirm('You lost 🥺. Try again?')) {
        boardDispatch({ type: 'restart' })
        return
      }

      Alert.alert('You lost 🥺', 'Try again?', [
        {
          text: 'Yessss!',
          onPress: () => {
            boardDispatch({ type: 'restart' })
          },
        },
      ])
    }, 100)
  }, [
    isMultiplayer,
    peerConnection,
    boardDispatch,
    isGameOver,
    hasWon,
    remoteHasWon,
    remoteIsGameOver,
    remoteBoard,
    board,
  ])

  // onConfigurePeerConnection
  useEffect(() => {
    // Received connection
    peerInstance.on('connection', (conn) => {
      setIsConfiguringMultiplayer(true)
      multiplayerConfigure(conn)
    })

    // Disconnected
    peerInstance.on('disconnected', (currentId) => {
      if (!isMultiplayer) return

      console.log('disconnected!', currentId)
      if (Platform.OS === 'web') {
        alert('Disconnected from peer.')
      } else {
        Alert.alert('Disconnected', 'You disconnected from the peer.')
      }

      resetMultiplayerStatus(false)
    })
  }, [
    peerInstance,
    multiplayerDispatch,
    multiplayerConfigure,
    boardDispatch,
    isMultiplayer,
    resetMultiplayerStatus,
  ])

  // #endregion

  return (
    <>
      <GestureDetector gesture={moveGesture}>
        <View h="$full" w="$full" alignItems="center">
          <Background />
          <Box
            backgroundColor="$white"
            borderRadius="$2xl"
            borderWidth="$4"
            borderColor="$white"
            p="$4"
            mt="$2"
            alignItems="center"
            sx={{
              ...(isBrowser
                ? {
                  shadowColor: '$black',
                  shadowOffset: {
                    height: 2,
                    width: 1,
                  },
                  shadowRadius: '$1',
                  shadowOpacity: 0.4,
                }
                : {}),
            }}
          >
            <HStack
              w="$full"
              space="md"
              justifyContent="center"
              alignItems="center"
            >
              {!isMultiplayer && (
                <Button
                  action="positive"
                  isDisabled={isConfiguringMultiplayer}
                  onPress={() => {
                    setIsConfiguringMultiplayer(true)
                  }}
                >
                  {isConfiguringMultiplayer ? (
                    <ButtonSpinner mr="$2" />
                  ) : (
                    <ButtonIcon as={ShareIcon} mr="$2" />
                  )}
                  <ButtonText>
                    {isConfiguringMultiplayer
                      ? 'Connecting to player...'
                      : 'Multiplayer'}
                  </ButtonText>
                </Button>
              )}
              {!isMultiplayer && <RestartButton />}
            </HStack>

            <GameHeading />

            <Box alignItems="center" width="$full">
              {!isMultiplayer ? (
                <Board board={board} />
              ) : (
                <>
                  {isBrowser && (
                    <HStack space="md" alignItems="center">
                      <View alignItems="center">
                        <Text fontWeight="$bold">You</Text>
                        <Board board={board} />
                      </View>
                      {remoteBoard && (
                        <View alignItems="center">
                          <Text fontWeight="$bold">Opponent</Text>
                          <Board board={remoteBoard} />
                        </View>
                      )}
                    </HStack>
                  )}
                  {isMobile && (
                    <VStack space="md" alignItems="center">
                      <View alignItems="center">
                        <Text fontWeight="$bold">You</Text>
                        <Board board={board} />
                      </View>
                      {remoteBoard && (
                        <View alignItems="center">
                          <Text fontWeight="$bold" marginBottom="$2">
                            Opponent's max tile
                          </Text>
                          <Tile
                            i={0}
                            j={0}
                            tile={{
                              value: findGreatestTileValue(remoteBoard),
                              isCombined: false,
                              isNew: false,
                              ids: [''],
                            }}
                          />
                        </View>
                      )}
                    </VStack>
                  )}
                </>
              )}
            </Box>

            {!isMultiplayer && (
              <HStack space="lg" marginTop="$2" w="$full" flex={1}>
                <Box
                  alignItems="center"
                  borderRadius="$lg"
                  backgroundColor="$trueGray100"
                  py="$2"
                  px="$4"
                  flex={2}
                >
                  <Text fontSize="$md">Score</Text>
                  <Text fontWeight="$black" fontSize="$xl">
                    {currScore}
                  </Text>
                </Box>
                <Box
                  alignItems="center"
                  borderRadius="$lg"
                  backgroundColor="$trueGray300"
                  py="$2"
                  px="$4"
                  flex={1}
                >
                  <Text fontSize="$md">Best</Text>
                  <Text fontWeight="$black" fontSize="$xl">
                    {highestScore}
                  </Text>
                </Box>
              </HStack>
            )}
          </Box>
        </View>
      </GestureDetector>

      <Modal
        isOpen={isConfiguringMultiplayer}
        onClose={() => {
          setIsConfiguringMultiplayer(false)
          setHasCopiedCurrId(false)
        }}
      >
        <ModalBackdrop />
        {!isMultiplayer ? (
          <ModalContent>
            <ModalHeader>
              <Heading>Connect to player</Heading>
              <ModalCloseButton>
                <Icon as={CloseIcon} />
              </ModalCloseButton>
            </ModalHeader>

            <ModalBody>
              <Input
                variant="outline"
                size="md"
                isDisabled={isConnectingToPlayer}
                isInvalid={remotePlayerId === ''}
                isReadOnly={false}
              >
                <InputField
                  placeholder="Insert player ID"
                  onChange={(ev) => {
                    setTypeRemotePlayerId(ev.nativeEvent.text)
                  }}
                />
                {isConnectingToPlayer && <Spinner size="small" m="$1" />}
              </Input>
              {hasConnectionError && (
                <Text>It was not possible to connect to peer.</Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                size="sm"
                action="secondary"
                mr="$3"
                onPress={() => {
                  Clipboard.setStringAsync(currPlayerId).then(() => {
                    setHasCopiedCurrId(true)
                  })
                }}
              >
                {hasCopiedCurrId && <ButtonIcon mr="$1" as={Check} />}
                <ButtonText>
                  {!hasCopiedCurrId ? 'Copy ID' : 'Copied!'}
                </ButtonText>
              </Button>
              <Button
                variant="outline"
                size="sm"
                action="secondary"
                mr="$3"
                onPress={() => {
                  setIsConfiguringMultiplayer(false)
                  setHasCopiedCurrId(false)
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                size="sm"
                action="positive"
                borderWidth="$0"
                isDisabled={isConnectingToPlayer}
                onPress={() => {
                  if (typeRemotePlayerId === '') return

                  setIsConnectingToPlayer(true)
                  setHasConnectionError(false)
                  setHasCopiedCurrId(false)

                  multiplayerConnectToPeer()
                }}
              >
                <ButtonText>Connect</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        ) : (
          <ModalContent>
            <ModalHeader>
              <Heading>Connected to player!</Heading>
            </ModalHeader>
            <ModalBody>
              <Text>Have a good versus game! 😄</Text>
            </ModalBody>
            <ModalFooter />
          </ModalContent>
        )}
      </Modal>
    </>
  )
}
