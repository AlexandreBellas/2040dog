import { useBoard, useBoardDispatch } from '@contexts/BoardContext'
import {
  Box,
  Button,
  ButtonIcon,
  HStack,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
import { IDirection } from '@interfaces/direction'
import BoardDatabaseService from '@services/database/board.database'
import { RotateCcw } from 'lucide-react-native'
import { useEffect } from 'react'
import { Alert, Platform } from 'react-native'
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler'

import Tile from './Tile'

export default function Board() {
  // #region Contexts
  const { board, isGameOver, hasWon, numOfMoves } = useBoard()
  const boardDispatch = useBoardDispatch()
  // #endregion

  // #region Constant values
  const space = 'md'
  // #endregion

  // #region Animation
  const rightFlingGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .numberOfPointers(1)
    .shouldCancelWhenOutside(true)
    .runOnJS(true)
    .onEnd(() => {
      boardDispatch({ type: 'move', direction: 'right' })
    })
  const leftFlingGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .numberOfPointers(1)
    .shouldCancelWhenOutside(true)
    .runOnJS(true)
    .onEnd(() => {
      boardDispatch({ type: 'move', direction: 'left' })
    })
  const upFlingGesture = Gesture.Fling()
    .direction(Directions.UP)
    .numberOfPointers(1)
    .shouldCancelWhenOutside(true)
    .runOnJS(true)
    .onEnd(() => {
      boardDispatch({ type: 'move', direction: 'up' })
    })
  const downFlingGesture = Gesture.Fling()
    .direction(Directions.DOWN)
    .numberOfPointers(1)
    .shouldCancelWhenOutside(true)
    .runOnJS(true)
    .onEnd(() => {
      boardDispatch({ type: 'move', direction: 'down' })
    })
  const moveGesture = Gesture.Race(
    rightFlingGesture,
    leftFlingGesture,
    upFlingGesture,
    downFlingGesture,
  )
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
      <Box alignItems="center" width="$full">
        <View w="$full" alignItems="flex-end">
          <Button
            size="md"
            variant="outline"
            borderRadius="$lg"
            borderWidth="$2"
            action="secondary"
            isFocusVisible={false}
            onPress={() => {
              const confirmationTitle = 'Are you sure?'
              const confirmationMessage = 'Your progress will be lost. 🦴'
              if (Platform.OS === 'web') {
                if (confirm(`${confirmationTitle} ${confirmationMessage}`)) {
                  boardDispatch({ type: 'restart' })
                }

                return
              }

              Alert.alert(confirmationTitle, confirmationMessage, [
                {
                  text: 'No',
                },
                {
                  text: 'Restart',
                  onPress: () => {
                    boardDispatch({ type: 'restart' })
                  },
                },
              ])
            }}
          >
            <ButtonIcon as={RotateCcw} />
          </Button>
        </View>
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
