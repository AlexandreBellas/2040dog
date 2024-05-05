import { Button, ButtonSpinner, CloseIcon, Image, InputField, ModalBody, Spinner, Text } from "@gluestack-ui/themed";
import { Box } from "@gluestack-ui/themed";
import { View } from "@gluestack-ui/themed";
import { BrowserView, isBrowser } from "react-device-detect";
import Board from "./Board";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { useBoard, useBoardDispatch } from "@contexts/BoardContext";
import { IDirection } from "@interfaces/direction";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import BoardDatabaseService from "@services/database/board.database";
import { useMultiplayer, useMultiplayerDispatch } from "@contexts/MultiplayerContext";
import { IBoard } from "@interfaces/board";
import { ButtonIcon } from "@gluestack-ui/themed";
import { ShareIcon } from "@gluestack-ui/themed";
import { ButtonText } from "@gluestack-ui/themed";
import { Modal } from "@gluestack-ui/themed";
import { ModalBackdrop } from "@gluestack-ui/themed";
import { ModalContent } from "@gluestack-ui/themed";
import { ModalHeader } from "@gluestack-ui/themed";
import { Heading } from "@gluestack-ui/themed";
import { ModalCloseButton } from "@gluestack-ui/themed";
import { Icon } from "@gluestack-ui/themed";
import { Input } from "@gluestack-ui/themed";
import { ModalFooter } from "@gluestack-ui/themed";
import { Check } from "lucide-react-native";
import * as Clipboard from 'expo-clipboard';

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
    const { board, isGameOver, numOfMoves, hasWon } = useBoard()
    const boardDispatch = useBoardDispatch()
    const { peerInstance, remotePlayerId, currPlayerId, remoteBoard } =
        useMultiplayer()
    const multiplayerDispatch = useMultiplayerDispatch()
    // #endregion

    // #region States
    const [isConfiguringMultiplayer, setIsConfiguringMultiplayer] =
        useState(false)
    const [isConnectingToPlayer, setIsConnectingToPlayer] = useState(false)
    const [typeRemotePlayerId, setTypeRemotePlayerId] = useState('')
    const [hasConnectionError, setHasConnectionError] = useState(false)
    const [hasCopiedCurrId, setHasCopiedCurrId] = useState(false)
    // #endregion

    console.log(currPlayerId)

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
        BoardDatabaseService.save(board)
    }, [board, boardDispatch, numOfMoves, isGameOver])

    // onEndGame
    useEffect(() => {
        if (!isGameOver) return

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
    }, [boardDispatch, isGameOver, hasWon])

    // onMultiplayerConnect
    useEffect(() => {
        peerInstance.on('connection', (conn) => {
            multiplayerDispatch({ type: 'set-connection', connection: conn })

            conn.on('open', () => {
                multiplayerDispatch({
                    type: 'set-active-type',
                    activeType: 'versus',
                    remotePlayerId: conn.peer,
                })
            })

            conn.on('data', (data) => {
                if (typeof data === 'object' && data !== null && 'board' in data) {
                    multiplayerDispatch({
                        type: 'set-remote-board',
                        board: data.board as IBoard,
                    })
                }
            })

            conn.on('close', () => {
                multiplayerDispatch({ type: 'remove-connection' })
            })
        })
    }, [multiplayerDispatch, peerInstance, currPlayerId, typeRemotePlayerId])
    // #endregion

    return (
        <>
            <GestureDetector gesture={moveGesture}>
                <View h="$full" w="$full" alignItems="center">
                    <BrowserView renderWithFragment>
                        <Image
                            w="$full"
                            h="$full"
                            position="absolute"
                            source={require('@assets/background.png')}
                            resizeMode="cover"
                            opacity="$20"
                        />
                    </BrowserView>
                    <Box
                        backgroundColor="$white"
                        borderRadius="$2xl"
                        borderWidth="$4"
                        borderColor="$white"
                        p="$4"
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
                        <Board />
                        <Button
                            mt="$2"
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
                                });
                            }}
                        >
                            {hasCopiedCurrId && <ButtonIcon mr="$1" as={Check} />}
                            <ButtonText>{!hasCopiedCurrId ? 'Copy your ID' : 'Copied!'}</ButtonText>
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

                                peerInstance.connect(typeRemotePlayerId)
                                peerInstance.on('error', () => {
                                    setHasConnectionError(true)
                                    setIsConnectingToPlayer(false)
                                })
                                peerInstance.on('open', () => { })
                            }}
                        >
                            <ButtonText>Submit</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}