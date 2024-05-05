import { Image } from "@gluestack-ui/themed";
import { Box } from "@gluestack-ui/themed";
import { View } from "@gluestack-ui/themed";
import { BrowserView } from "react-device-detect";
import Board from "./Board";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { useBoard, useBoardDispatch } from "@contexts/BoardContext";
import { IDirection } from "@interfaces/direction";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import BoardDatabaseService from "@services/database/board.database";

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

    // #endregion


    return (
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
                >
                    <Board />
                </Box>
            </View>
        </GestureDetector>
    )
}