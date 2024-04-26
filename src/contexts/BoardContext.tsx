import { IBoard } from '@interfaces/board'
import { IPosition } from '@interfaces/position'
import { ITile } from '@interfaces/tile'
import React, { createContext, useContext, useReducer } from 'react'

// #region Functions
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
// #endregion

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
      direction: 'left' | 'right' | 'up' | 'down'
    }
  | {
      type: 'insert'
    }
// #endregion

// #region Context definitions
export const BoardContext = createContext({} as IBoardContextState)
export const BoardContextDispatch = createContext(
  {} as React.Dispatch<IBoardContextAction>,
)
// #endregion

// #region Hooks definitions
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

// #region Provider definition
export function BoardProvider({ children }: Readonly<IBoardProviderProps>) {
  const initialTile: ITile = { value: null, isCombined: false }
  const initialRow: ITile[] = [initialTile, initialTile, initialTile]
  const initialState: IBoardContextState = {
    board: { tiles: [initialRow, initialRow, initialRow] },
    isGameOver: false,
    hasWon: false,
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

// #region Reducer definition
function BoardReducer(
  state: IBoardContextState,
  action: IBoardContextAction,
): IBoardContextState {
  switch (action.type) {
    case 'move': {
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
