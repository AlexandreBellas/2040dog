import { useBoard, useBoardDispatch } from '@contexts/BoardContext'
import { Box, HStack, Text, VStack } from '@gluestack-ui/themed'
import { IDirection } from '@interfaces/direction'
import { memo, useEffect } from 'react'
import { Alert, Platform } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import Tile from './Tile'

const Board = () => {
  // #region Contexts
  const { board, boardPreviousState, isGameOver, hasWon, numOfMoves } =
    useBoard()
  const boardDispatch = useBoardDispatch()
  // #endregion

  // #region Constant values
  const space = 'md'
  // #endregion

  // #region Animation
  // #region Shared values
  const startXSlide = useSharedValue<number | null>(null)
  const startYSlide = useSharedValue<number | null>(null)
  // #endregion
  // #region Gestures
  const pan = Gesture.Pan()
    .activeOffsetX([-100, 100])
    .activeOffsetY([-100, 100])
    .onStart((e) => {
      startXSlide.value = e.x
      startYSlide.value = e.y
    })
    .onEnd((e) => {
      const dx = e.x - (startXSlide.value ?? 0)
      const dy = e.y - (startYSlide.value ?? 0)
      if (dx === 0 && dy === 0) return

      let boardAction: { type: 'move'; direction: IDirection }

      if (Math.abs(dx) > Math.abs(dy)) {
        boardAction =
          dx > 0
            ? { type: 'move', direction: 'right' }
            : { type: 'move', direction: 'left' }
      } else {
        boardAction =
          dy > 0
            ? { type: 'move', direction: 'down' }
            : { type: 'move', direction: 'up' }
      }

      boardDispatch(boardAction)
    })
    .onFinalize(() => {
      startXSlide.value = null
      startYSlide.value = null
    })
  // #endregion
  // #endregion

  // #region Effects

  // Keyboard listener
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
  }, [boardDispatch, numOfMoves, isGameOver])

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
    <GestureDetector gesture={pan}>
      <Box alignItems="center" width="100%">
        <Text fontFamily="$heading" fontSize="$6xl">
          2040🐶
        </Text>
        <Text>(only some dogs)</Text>
        <VStack
          borderRadius={`$${space}`}
          borderColor="#bbada0"
          borderWidth="$8"
          space={space}
          backgroundColor="#bbada0"
          marginTop="$2"
        >
          {board.tiles.map((row, rowIdx) => (
            <HStack key={`tiles-row-${row.toString()}-${rowIdx}`} space={space}>
              {row.map((tile, columnIdx) => (
                <Tile
                  key={`tiles-column-${rowIdx}-${columnIdx}`}
                  i={rowIdx}
                  j={columnIdx}
                  value={tile.value}
                  hasBeenCombined={tile.isCombined}
                  isNew={tile.isNew}
                />
              ))}
            </HStack>
          ))}
        </VStack>
      </Box>
    </GestureDetector>
  )
}

export default memo(Board)
