import { HStack, VStack } from '@gluestack-ui/themed'
import { IBoard } from '@interfaces/board'

import Tile from './Tile'

interface IBoardProps {
  board: IBoard
}

export default function Board(props: Readonly<IBoardProps>) {
  // #region Contexts
  const { board } = props
  // #endregion

  // #region Constant values
  const space = 'md'
  // #endregion

  return (
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
              value={tile?.value}
              hasBeenCombined={tile?.isCombined ?? false}
              isNew={tile?.isNew ?? false}
            />
          ))}
        </HStack>
      ))}
    </VStack>
  )
}
