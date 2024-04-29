import { useBoard, useBoardDispatch } from '@contexts/BoardContext'
import { Box, HStack, Text, VStack } from '@gluestack-ui/themed'
import { IDirection } from '@interfaces/direction'
import { useEffect } from 'react'
import { Alert, Platform } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

import Tile from './Tile'

export default function Board() {
  // #region Contexts
  const { board, isGameOver, hasWon, numOfMoves } = useBoard()
  const boardDispatch = useBoardDispatch()
  // #endregion

  // #region Constant values
  const space = 'md'
  const pan = Gesture.Pan()
    .activeOffsetX([-200, 200])
    .activeOffsetY([-200, 200])
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > Math.abs(e.velocityY)) {
        if (e.velocityX > 0) {
          boardDispatch({ type: 'move', direction: 'right' })
        } else {
          boardDispatch({ type: 'move', direction: 'left' })
        }

        return
      }

      if (e.velocityY > 0) {
        boardDispatch({ type: 'move', direction: 'down' })
      } else {
        boardDispatch({ type: 'move', direction: 'up' })
      }
    })
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
        <Text>(yet no dogs)</Text>
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
                  value={tile.value}
                />
              ))}
            </HStack>
          ))}
        </VStack>
      </Box>
    </GestureDetector>
  )
}
