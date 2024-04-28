import { IBoard } from '@interfaces/board'
import { IDirection } from '@interfaces/direction'
import { IPosition } from '@interfaces/position'
import { ITile } from '@interfaces/tile'
import React, { createContext, useContext, useReducer } from 'react'

// #region Context types
interface IBoardProviderProps {
  children: JSX.Element
}

interface IBoardContextState {
  board: IBoard
  isGameOver: boolean
  hasWon: boolean
  numOfMoves: number
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
// #endregion

// #region Constant variables
const boardLength = 4
// #endregion

// #region Functions
function createNewBoard() {
  const tiles: ITile[][] = []
  for (let i = 0; i < boardLength; i++) {
    tiles.push([])
    for (let j = 0; j < boardLength; j++) {
      tiles[i].push({ value: null, isCombined: false })
    }
  }
  return { tiles } as IBoard
}

function createTestBoard() {
  return {
    tiles: [
      [
        { value: 2, isCombined: false },
        { value: 4, isCombined: false },
        { value: 8, isCombined: false },
        { value: 16, isCombined: false },
      ],
      [
        { value: 32, isCombined: false },
        { value: 64, isCombined: false },
        { value: 128, isCombined: false },
        { value: 256, isCombined: false },
      ],
      [
        { value: 512, isCombined: false },
        { value: 1024, isCombined: false },
        { value: 2048, isCombined: false },
        { value: null, isCombined: false },
      ],
      [
        { value: null, isCombined: false },
        { value: null, isCombined: false },
        { value: null, isCombined: false },
        { value: null, isCombined: false },
      ],
    ],
  } as IBoard
}

function listEmptySpots(board: IBoard) {
  const { tiles } = board
  const emptySpots: IPosition[] = []

  tiles.forEach((row, i) =>
    row.forEach((tile, j) => {
      if (tile.value === null) {
        emptySpots.push({ i, j })
      }
    }),
  )

  return emptySpots
}

function newRandomTileValue() {
  return Math.random() < 0.8 ? 2 : 4
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

function isPossibleToMove(board: IBoard) {
  return (
    !isBoardFull(board) ||
    board.tiles.some((row, i, tiles) =>
      row.some((tile, j) => {
        return (
          (i > 0 && tiles[i - 1][j].value === tile.value) ||
          (i < boardLength - 1 && tiles[i + 1][j].value === tile.value) ||
          (j > 0 && tiles[i][j - 1].value === tile.value) ||
          (j < boardLength - 1 && tiles[i][j + 1].value === tile.value)
        )
      }),
    )
  )
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
      return board.tiles
        .map((row, i, tiles) =>
          row.map((tile, j) => {
            if (i === 0 || tile.value === null) return false

            let nextI = i
            while (nextI > 0 && tiles[nextI - 1][j].value === null) {
              nextI--
            }

            if (
              nextI > 0 &&
              tiles[nextI - 1][j].value === tile.value &&
              !tiles[nextI - 1][j].isCombined
            ) {
              tiles[nextI - 1][j] = { value: tile.value * 2, isCombined: true }
            } else {
              if (nextI === i) return false
              tiles[nextI][j] = { ...tile }
            }

            tiles[i][j] = { value: null, isCombined: false }

            return true
          }),
        )
        .flat()
        .some((item) => item === true)
    }
    case 'down': {
      const reversedIndexes = Array.from(
        Array(board.tiles.length).keys(),
      ).reverse()

      return reversedIndexes
        .map((i) => {
          const tiles = board.tiles
          const row = board.tiles[i]

          return row.map((tile, j) => {
            if (i === boardLength - 1 || tile.value === null) return false

            let nextI = i
            while (
              nextI < boardLength - 1 &&
              tiles[nextI + 1][j].value === null
            ) {
              nextI++
            }

            if (
              nextI < boardLength - 1 &&
              tiles[nextI + 1][j].value === tile.value &&
              !tiles[nextI + 1][j].isCombined
            ) {
              tiles[nextI + 1][j] = { value: tile.value * 2, isCombined: true }
            } else {
              if (nextI === i) return false
              tiles[nextI][j] = { ...tile }
            }

            tiles[i][j] = { value: null, isCombined: false }

            return true
          })
        })
        .flat()
        .some((item) => item === true)
    }
    case 'left': {
      return board.tiles
        .map((row, i, tiles) =>
          row.map((tile, j) => {
            if (j === 0 || tile.value === null) return false

            let nextJ = j
            while (nextJ > 0 && tiles[i][nextJ - 1].value === null) {
              nextJ--
            }

            if (
              nextJ > 0 &&
              tiles[i][nextJ - 1].value === tile.value &&
              !tiles[i][nextJ - 1].isCombined
            ) {
              tiles[i][nextJ - 1] = { value: tile.value * 2, isCombined: true }
            } else {
              if (nextJ === j) return false
              tiles[i][nextJ] = { ...tile }
            }

            tiles[i][j] = { value: null, isCombined: false }

            return true
          }),
        )
        .flat()
        .some((item) => item === true)
    }
    case 'right': {
      return board.tiles
        .map((row, i, tiles) => {
          const reversedIndexes = Array.from(
            Array(board.tiles.length).keys(),
          ).reverse()

          return reversedIndexes.map((j) => {
            const tile = tiles[i][j]
            if (j === boardLength - 1 || tile.value === null) return false

            let nextJ = j
            while (
              nextJ < boardLength - 1 &&
              tiles[i][nextJ + 1].value == null
            ) {
              nextJ++
            }

            if (
              nextJ < boardLength - 1 &&
              tiles[i][nextJ + 1].value === tile.value &&
              !tiles[i][nextJ + 1].isCombined
            ) {
              tiles[i][nextJ + 1] = { value: tile.value * 2, isCombined: true }
            } else {
              if (nextJ === j) return false
              tiles[i][nextJ] = { ...tile }
            }

            tiles[i][j] = { value: null, isCombined: false }

            return true
          })
        })
        .flat()
        .some((item) => item === true)
    }
  }
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
    numOfMoves: 0,
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
      numOfMoves: 0,
    }
  }

  if (state.isGameOver) return state

  switch (action.type) {
    case 'move': {
      const hasMoved = move(state.board, action.direction)
      resetCombinedStates(state.board)
      const hasWon = doesBoardHave2048(state.board)
      const isGameOver = hasWon || !isPossibleToMove(state.board)

      return {
        ...state,
        hasWon,
        isGameOver,
        numOfMoves: state.numOfMoves + (hasMoved ? 1 : 0),
      }
    }
    case 'insert': {
      if (state.hasWon) return state

      insertRandomTile(state.board)
      return {
        ...state,
        isGameOver: !isPossibleToMove(state.board),
      }
    }
    default: {
      return state
    }
  }
}
// #endregion
