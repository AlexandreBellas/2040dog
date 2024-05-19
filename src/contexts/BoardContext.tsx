import { IBoard } from '@interfaces/board'
import { IDirection } from '@interfaces/direction'
import { IMove } from '@interfaces/move'
import { IPosition } from '@interfaces/position'
import { v4 as uuidv4 } from 'uuid'
import BoardDatabaseService from '@services/database/board.database'
import React, { createContext, useContext, useReducer } from 'react'

// #region Context types
interface IBoardProviderProps {
  board?: IBoard
  currScore?: number
  highestScore?: number
  children: JSX.Element
}

interface IBoardContextState {
  board: IBoard
  boardPreviousState: IBoard
  tilesLastMoves: IMove[]
  isGameOver: boolean
  hasWon: boolean
  numOfMoves: number
  currScore: number
  highestScore: number
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
  | {
    type: 'clean-up'
  }
// #endregion

// #region Constant variables
const boardLength = 4
// #endregion

// #region Functions
function createNewBoard() {
  const tiles: IBoard['tiles'] = []
  for (let i = 0; i < boardLength; i++) {
    tiles.push([])
    for (let j = 0; j < boardLength; j++) {
      tiles[i].push(null)
    }
  }
  return { tiles } as IBoard
}

function createTestBoard(): IBoard {
  return {
    tiles: [
      [
        { value: 2, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 4, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 8, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 16, isCombined: false, isNew: false, ids: [uuidv4()] },
      ],
      [
        { value: 32, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 64, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 128, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 256, isCombined: false, isNew: false, ids: [uuidv4()] },
      ],
      [
        { value: 512, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 1024, isCombined: false, isNew: false, ids: [uuidv4()] },
        { value: 2048, isCombined: false, isNew: false, ids: [uuidv4()] },
        null,
      ],
      [
        null,
        null,
        null,
        null,
      ],
    ],
  }
}

function deepCopyBoard(board: IBoard): IBoard {
  return {
    tiles: [...board.tiles.map((row) => [...row.map((tile) => tile === null ? null : { ...tile })])],
  }
}

function listEmptySpots(board: IBoard) {
  const { tiles } = board
  const emptySpots: IPosition[] = []

  tiles.forEach((row, i) =>
    row.forEach((tile, j) => {
      if (tile === null) {
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

  board.tiles[randomSpot.i][randomSpot.j] = {
    value: newRandomTileValue(),
    isNew: true,
    isCombined: false,
    ids: [uuidv4()],
  }

  return board
}

function getTile(board: IBoard, position: IPosition) {
  return board.tiles[position.i][position.j]
}

function isBoardFull(board: IBoard) {
  return board.tiles.every((row) => row.every((tile) => tile !== null))
}

function isPossibleToMove(board: IBoard) {
  return (
    !isBoardFull(board) ||
    board.tiles.some((row, i, tiles) =>
      row.some((tile, j) => {
        return (
          (i > 0 && tiles[i - 1][j]!.value === tile!.value) ||
          (i < boardLength - 1 && tiles[i + 1][j]!.value === tile!.value) ||
          (j > 0 && tiles[i][j - 1]!.value === tile!.value) ||
          (j < boardLength - 1 && tiles[i][j + 1]!.value === tile!.value)
        )
      }),
    )
  )
}

function doesBoardHave2048(board: IBoard) {
  return board.tiles.some((row) => row.some((tile) => tile?.value === 2048))
}

function resetCombinedAndNewStates(board: IBoard) {
  board.tiles.forEach((row) => {
    row.forEach((item) => {
      if (item !== null) {
        item.isCombined = false
        item.isNew = false
        item.ids = [item.ids[0]]
      }
    })
  })

  return board
}

function move(board: IBoard, direction: IDirection): IMove[] {
  const moves: IMove[] = []

  switch (direction) {
    case 'up': {
      board.tiles.forEach((row, i, tiles) =>
        row.forEach((tile, j) => {
          if (i === 0 || tile === null) return

          let nextI = i
          while (nextI > 0 && tiles[nextI - 1][j] === null) {
            nextI--
          }

          if (
            nextI > 0 &&
            tiles[nextI - 1][j]!.value === tile.value &&
            !tiles[nextI - 1][j]!.isCombined
          ) {
            tiles[nextI - 1][j] = {
              value: tile.value * 2,
              isCombined: true,
              isNew: false,
              ids: [tiles[nextI - 1][j]!.ids[0], tile.ids[0]]
            }

          } else {
            if (nextI === i) return
            tiles[nextI][j] = { ...tile }
          }

          tiles[i][j] = null

          moves.push({
            previous: { i, j },
            after: { i: nextI, j },
          })
        }),
      )

      break
    }
    case 'down': {
      const reversedIndexes = Array.from(
        Array(board.tiles.length).keys(),
      ).reverse()

      reversedIndexes.forEach((i) => {
        const tiles = board.tiles
        const row = board.tiles[i]

        return row.forEach((tile, j) => {
          if (i === boardLength - 1 || tile === null) return

          let nextI = i
          while (
            nextI < boardLength - 1 &&
            tiles[nextI + 1][j] === null
          ) {
            nextI++
          }

          if (
            nextI < boardLength - 1 &&
            tiles[nextI + 1][j]!.value === tile.value &&
            !tiles[nextI + 1][j]!.isCombined
          ) {
            tiles[nextI + 1][j] = {
              value: tile.value * 2,
              isCombined: true,
              isNew: false,
              ids: [tiles[nextI + 1][j]!.ids[0], tile.ids[0]]
            }
          } else {
            if (nextI === i) return
            tiles[nextI][j] = { ...tile }
          }

          tiles[i][j] = null

          moves.push({
            previous: { i, j },
            after: { i: nextI, j },
          })
        })
      })

      break
    }
    case 'left': {
      board.tiles.forEach((row, i, tiles) =>
        row.forEach((tile, j) => {
          if (j === 0 || tile === null) return

          let nextJ = j
          while (nextJ > 0 && tiles[i][nextJ - 1] === null) {
            nextJ--
          }

          if (
            nextJ > 0 &&
            tiles[i][nextJ - 1]!.value === tile.value &&
            !tiles[i][nextJ - 1]!.isCombined
          ) {
            tiles[i][nextJ - 1] = {
              value: tile.value * 2,
              isCombined: true,
              isNew: false,
              ids: [tiles[i][nextJ - 1]!.ids[0], tile.ids[0]]
            }
          } else {
            if (nextJ === j) return
            tiles[i][nextJ] = { ...tile }
          }

          tiles[i][j] = null

          moves.push({
            previous: { i, j },
            after: { i, j: nextJ },
          })
        }),
      )

      break
    }
    case 'right': {
      board.tiles.forEach((row, i, tiles) => {
        const reversedIndexes = Array.from(
          Array(board.tiles.length).keys(),
        ).reverse()

        return reversedIndexes.forEach((j) => {
          const tile = tiles[i][j]
          if (j === boardLength - 1 || tile === null) return

          let nextJ = j
          while (nextJ < boardLength - 1 && tiles[i][nextJ + 1] == null) {
            nextJ++
          }

          if (
            nextJ < boardLength - 1 &&
            tiles[i][nextJ + 1]!.value === tile.value &&
            !tiles[i][nextJ + 1]!.isCombined
          ) {
            tiles[i][nextJ + 1] = {
              value: tile.value * 2,
              isCombined: true,
              isNew: false,
              ids: [tiles[i][nextJ + 1]!.ids[0], tile.ids[0]]
            }
          } else {
            if (nextJ === j) return
            tiles[i][nextJ] = { ...tile }
          }

          tiles[i][j] = null

          moves.push({
            previous: { i, j },
            after: { i, j: nextJ },
          })
        })
      })

      break
    }
  }

  return moves
}

function findGreatestTileValue(board: IBoard): number {
  return board.tiles.reduce((prevGreatest, currRow) => {
    const greatestInRow = currRow.reduce(
      (prev, curr) =>
        curr !== null && curr.value > prev ? curr.value : prev,
      0,
    )

    return greatestInRow > prevGreatest ? greatestInRow : prevGreatest
  }, 0)
}

function countPointsOfCombined(board: IBoard): number {
  return board.tiles.reduce(
    (prevTotalSum, currRow) =>
      prevTotalSum +
      currRow.reduce(
        (prev, curr) =>
          prev + (curr !== null && curr.isCombined ? curr.value : 0),
        0,
      ),
    0,
  )
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
  return { getTile, isBoardFull, createNewBoard, findGreatestTileValue }
}
// #endregion

// #region Provider definitions
export function BoardProvider({
  children,
  board,
  currScore,
  highestScore,
}: Readonly<IBoardProviderProps>) {
  const newBoard = board ?? createNewBoard()
  const initialState: IBoardContextState = {
    board: newBoard,
    boardPreviousState: newBoard,
    tilesLastMoves: [],
    hasWon: doesBoardHave2048(newBoard),
    isGameOver: doesBoardHave2048(newBoard),
    numOfMoves: 0,
    currScore: currScore ?? 0,
    highestScore: highestScore ?? 0,
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
  resetCombinedAndNewStates(state.board)

  if (action.type === 'restart') {
    BoardDatabaseService.delete()

    const board = createNewBoard()
    return {
      board,
      boardPreviousState: board,
      tilesLastMoves: [],
      hasWon: false,
      isGameOver: false,
      numOfMoves: 0,
      currScore: 0,
      highestScore: state.highestScore,
    }
  }

  if (state.isGameOver) return state

  const boardPreviousState = deepCopyBoard(state.board)
  switch (action.type) {
    case 'move': {
      const moves = move(state.board, action.direction)
      const hasWon = doesBoardHave2048(state.board)
      const isGameOver = hasWon || !isPossibleToMove(state.board)

      const newCurrScore = state.currScore + countPointsOfCombined(state.board)
      const highestScore =
        newCurrScore > state.highestScore ? newCurrScore : state.highestScore

      return {
        ...state,
        boardPreviousState,
        tilesLastMoves: moves,
        hasWon,
        isGameOver,
        numOfMoves: state.numOfMoves + (moves.length > 0 ? 1 : 0),
        currScore: newCurrScore,
        highestScore,
      }
    }
    case 'insert': {
      if (state.hasWon) return state

      insertRandomTile(state.board)
      return {
        ...state,
        boardPreviousState,
        isGameOver: !isPossibleToMove(state.board),
      }
    }
    default: { // includes 'clean-up'
      return state
    }
  }
}
// #endregion
