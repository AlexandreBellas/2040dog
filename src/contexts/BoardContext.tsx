import { IBoard } from '@interfaces/board'
import { IDirection } from '@interfaces/direction'
import { IPosition } from '@interfaces/position'
import React, { createContext, useContext, useReducer } from 'react'

// #region Context types
interface IBoardProviderProps {
  children: JSX.Element
}

interface IBoardContextState {
  board: IBoard
  isGameOver: boolean
  hasWon: boolean
}

type IBoardContextAction =
  | {
      type: 'move'
      direction: IDirection
    }
  | {
      type: 'insert'
    }
  | {
      type: 'restart'
    }

interface IMoveWithParametersParams {
  board: IBoard
  walkOver: 'row' | 'column'
  indexSequence: number[]
}
// #endregion

// #region Constant variables
const boardLength = 4
// #endregion

// #region Functions
function createNewBoard() {
  return {
    tiles: Array(boardLength).fill(
      Array(boardLength).fill({
        value: null,
        isCombined: false,
      }),
    ),
  } as IBoard
}

function listEmptySpots(board: IBoard) {
  const { tiles } = board
  const emptySpots: IPosition[] = []

  tiles.forEach((row, i) =>
    row.forEach((value, j) => {
      if (value === null) {
        emptySpots.push({ i, j })
      }
    }),
  )

  return emptySpots
}

function newRandomTileValue() {
  return Math.random() > 0.8 ? 2 : 4
}

function insertRandomTile(board: IBoard) {
  const emptySpots = listEmptySpots(board)
  if (emptySpots.length === 0) return board

  const randomSpotIndex = Math.floor(Math.random() * emptySpots.length)
  const randomSpot = emptySpots[randomSpotIndex]

  board.tiles[randomSpot.i][randomSpot.j].value = newRandomTileValue()

  return board
}

function getTile(board: IBoard, position: IPosition) {
  return board.tiles[position.i][position.j]
}

function isBoardFull(board: IBoard) {
  return board.tiles.every((row) => row.every((tile) => tile.value !== null))
}

function doesBoardHave2048(board: IBoard) {
  return board.tiles.some((row) => row.some((tile) => tile.value === 2048))
}

function resetCombinedStates(board: IBoard) {
  board.tiles.forEach((row) => {
    row.forEach((_, idx, arr) => {
      arr[idx].isCombined = false
    })
  })

  return board
}

function move(board: IBoard, direction: IDirection) {
  switch (direction) {
    case 'up': {
      board.tiles.forEach((row, i) => {
        row.forEach((tile, j) => {
          if (i === 0) return

          if (board.tiles[i - 1][j].value === null) {
            let currI = i
            let nextI = i - 1
            while (nextI >= 0 && board.tiles[nextI][j].value === null) {
              board.tiles[nextI][j].value = tile.value
              board.tiles[nextI][j].isCombined = tile.isCombined

              board.tiles[currI][j].value = null
              board.tiles[currI][j].isCombined = false

              currI--
              nextI--
            }
          }
        })
      })

      return
    }
    case 'down': {
      board.tiles.forEach((row, i) => {
        row.forEach((tile, j) => {
          if (i === boardLength - 1) return

          if (board.tiles[i + 1][j].value === null) {
            let currI = i
            let nextI = i + 1
            while (
              nextI <= boardLength - 1 &&
              board.tiles[nextI][j].value === null
            ) {
              board.tiles[nextI][j].value = tile.value
              board.tiles[nextI][j].isCombined = tile.isCombined

              board.tiles[currI][j].value = null
              board.tiles[currI][j].isCombined = false

              currI++
              nextI++
            }
          }
        })
      })

      return
    }
    case 'left': {
      board.tiles.forEach((row, i) => {
        row.forEach((tile, j) => {
          if (j === 0) return

          if (board.tiles[i][j - 1].value === null) {
            let currJ = j
            let nextJ = j - 1
            while (nextJ >= 0 && board.tiles[i][nextJ].value === null) {
              board.tiles[i][nextJ].value = tile.value
              board.tiles[i][nextJ].isCombined = tile.isCombined

              board.tiles[currJ][j].value = null
              board.tiles[currJ][j].isCombined = false

              currJ--
              nextJ--
            }
          }
        })
      })

      return
    }
    case 'right': {
      board.tiles.forEach((row, i) => {
        row.forEach((tile, j) => {
          if (j === boardLength - 1) return

          if (board.tiles[i][j + 1].value === null) {
            let currJ = j
            let nextJ = j + 1
            while (
              nextJ <= boardLength - 1 &&
              board.tiles[i][nextJ].value === null
            ) {
              board.tiles[i][nextJ].value = tile.value
              board.tiles[i][nextJ].isCombined = tile.isCombined

              board.tiles[currJ][j].value = null
              board.tiles[currJ][j].isCombined = false

              currJ++
              nextJ++
            }
          }
        })
      })

      return
    }
    default: {
      return
    }
  }
}

// function moveWithParameters(params: IMoveWithParametersParams) {}

// #endregion

// #region Context definitions
export const BoardContext = createContext({} as IBoardContextState)
export const BoardContextDispatch = createContext(
  {} as React.Dispatch<IBoardContextAction>,
)
// #endregion

// #region Hook definitions
export function useBoard() {
  return useContext(BoardContext)
}

export function useBoardDispatch() {
  return useContext(BoardContextDispatch)
}

export function useBoardHelpers() {
  return { getTile, isBoardFull }
}
// #endregion

// #region Provider definitions
export function BoardProvider({ children }: Readonly<IBoardProviderProps>) {
  const initialState: IBoardContextState = {
    board: createNewBoard(),
    hasWon: false,
    isGameOver: false,
  }

  const [state, dispatch] = useReducer(BoardReducer, initialState)

  return (
    <BoardContext.Provider value={state}>
      <BoardContextDispatch.Provider value={dispatch}>
        {children}
      </BoardContextDispatch.Provider>
    </BoardContext.Provider>
  )
}
// #endregion

// #region Reducer definitions
function BoardReducer(
  state: IBoardContextState,
  action: IBoardContextAction,
): IBoardContextState {
  if (action.type === 'restart') {
    return {
      board: createNewBoard(),
      hasWon: false,
      isGameOver: false,
    }
  }

  if (state.isGameOver) return state

  switch (action.type) {
    case 'move': {
      move(state.board, action.direction)
      resetCombinedStates(state.board)
      const hasWon = doesBoardHave2048(state.board)
      return {
        ...state,
        hasWon,
        isGameOver: hasWon,
      }
    }
    case 'insert': {
      insertRandomTile(state.board)
      return {
        ...state,
        isGameOver: isBoardFull(state.board),
      }
    }
    default: {
      return state
    }
  }
}
// #endregion
