import { View } from '@gluestack-ui/themed'
import { IBoard } from '@interfaces/board'

import Tile from './Tile'
import BackgroundTile from './components/BackgroundTile'

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
    <View>
      {['bg', 'game'].map((id) => (
        <View
          id={id}
          key={`view--board-${id}`}
          position={id === 'bg' ? 'absolute' : undefined}
          borderRadius={`$${space}`}
          borderColor="#bbada0"
          borderWidth="$4"
          backgroundColor={id === 'bg' ? '#bbada0' : undefined}
          marginTop="$2"
          width={300}
          justifyContent="center"
          alignItems="center"
          flex={1}
          flexWrap="wrap"
          flexDirection="row"
          zIndex={id === 'bg' ? 0 : 1}
        >
          {board.tiles.map((row, rowIdx) =>
            row.map((tile, columnIdx) => {
              if (id === 'bg') {
                return (
                  <BackgroundTile key={`tiles-column-${rowIdx}-${columnIdx}`} />
                )
              }

              if (tile === null) return false

              return (
                <Tile
                  key={`tiles-column-${tile?.ids[0] ?? `${rowIdx}-${columnIdx}`}`}
                  i={rowIdx}
                  j={columnIdx}
                  tile={tile}
                />
              )
            }),
          )}
        </View>
      ))}
    </View>
  )
}
