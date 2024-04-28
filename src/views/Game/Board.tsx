import { useBoard, useBoardDispatch } from '@contexts/BoardContext'
import { Box, HStack, VStack } from '@gluestack-ui/themed'
import { IDirection } from '@interfaces/direction'
import { useEffect } from 'react'

import Tile from './Tile'

export default function Board() {
  // #region Constant values
  const space = 'md'
  // #endregion

  // #region Contexts
  const { board, isGameOver, hasWon, numOfMoves } = useBoard()
  const boardDispatch = useBoardDispatch()
  // #endregion

  // #region Effects

  // Keyboard listener
  useEffect(() => {
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
      if (hasWon) alert('eba')
      else alert('afs')
    }, 100)
  }, [isGameOver, hasWon])

  // #endregion

  return (
    <Box>
      <VStack
        borderRadius={`$${space}`}
        borderColor="#bbada0"
        borderWidth="$8"
        space={space}
        backgroundColor="#bbada0"
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
  )
}
