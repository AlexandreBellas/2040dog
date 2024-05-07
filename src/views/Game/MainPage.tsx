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
import * as Clipboard from 'expo-clipboard'
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
  const { board, isGameOver, numOfMoves, hasWon } = useBoard()
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
          boardDispatch({ type: 'move', direction: direction as IDirection })
        }),
  )
  const moveGesture = Gesture.Race(...gestures)
  // #endregion

  // #region Callbacks
  const multiplayerConfigure = useCallback(
    (peerConnection: DataConnection) => {
      // Open
      peerConnection.on('open', () => {
        console.log('connection open!', peerConnection)
        setHasConnectionError(false)
        setIsConnectingToPlayer(false)
        setIsMultiplayer(true)

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
        setIsMultiplayer(false)
        setIsConfiguringMultiplayer(false)
        setHasConnectionError(true)
        setIsConnectingToPlayer(false)

        if (Platform.OS === 'web') {
          alert('Connection error with peer.')
        } else {
          Alert.alert('Connection error', 'Connection had error with peer.')
        }

        multiplayerDispatch({ type: 'remove-connection' })
        boardDispatch({ type: 'restart' })
      })

      // Close
      peerConnection.on('close', () => {
        console.log('connection closed!')
        setIsMultiplayer(false)

        if (Platform.OS === 'web') {
          alert('Connection closed with peer.')
        } else {
          Alert.alert(
            'Connection closed',
            'Connection had been closed with peer.',
          )
        }

        multiplayerDispatch({ type: 'remove-connection' })
        boardDispatch({ type: 'restart' })
      })
    },
    [multiplayerDispatch, createNewBoard, boardDispatch],
  )

  function multiplayerConnectToPeer() {
    const conn = peerInstance.connect(typeRemotePlayerId)
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
      boardDispatch({ type: 'move', direction })
    }

    window.addEventListener('keydown', keyDownHandler)
    return () => window.removeEventListener('keydown', keyDownHandler)
  }, [boardDispatch])

  // onAfterMove
  useEffect(() => {
    if (isGameOver) return
    boardDispatch({ type: 'insert' })

    if (!isMultiplayer) {
      BoardDatabaseService.save(board)
    }

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
  ])

  // onEndGame
  useEffect(() => {
    if (isMultiplayer && remoteIsGameOver) {
      if (remoteHasWon) {
        if (Platform.OS === 'web') {
          alert('Oh no! You lost to your opponent 🥲🐶')
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

      Alert.alert('You lost to your opponent 🥲', 'You won.', [
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
      if (hasWon) {
        if (Platform.OS === 'web') {
          alert('Congratulations! You won your opponent 😎🐶')
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
          alert('Congratulations! ❤️ You deserve 2040 lickisses 🐶')
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
  ])

  // onConfigurePeerConnection
  useEffect(() => {
    // Received connection
    peerInstance.on('connection', (conn) => {
      console.log('received connection!')

      multiplayerConfigure(conn)
    })

    // Disconnected
    peerInstance.on('disconnected', (currentId) => {
      if (!isMultiplayer) return

      console.log('disconnected!', currentId)
      setIsMultiplayer(false)

      if (Platform.OS === 'web') {
        alert('Disconnected from peer.')
      } else {
        Alert.alert('Disconnected', 'You disconnected from the peer.')
      }

      multiplayerDispatch({ type: 'remove-connection' })
      boardDispatch({ type: 'restart' })
    })
  }, [
    peerInstance,
    multiplayerDispatch,
    multiplayerConfigure,
    boardDispatch,
    isMultiplayer,
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
                            value={findGreatestTileValue(remoteBoard)}
                            hasBeenCombined={false}
                            isNew={false}
                          />
                        </View>
                      )}
                    </VStack>
                  )}
                </>
              )}
            </Box>
          </Box>
        </View>
      </GestureDetector>

      <Modal
        isOpen={isConfiguringMultiplayer}
        onClose={() => {
          setIsConfiguringMultiplayer(false)
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

                  multiplayerConnectToPeer()
                }}
              >
                <ButtonText>Submit</ButtonText>
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
