import { IBoard } from '@interfaces/board'
import { IPosition } from '@interfaces/position'
import React, { createContext, useContext, useReducer } from 'react'

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
  | {
      type: 'restart'
    }
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
