import { IBoard } from '@interfaces/board'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default class BoardDatabaseService {
  private static key = 'board'

  private static serialize(board: IBoard): string {
    return JSON.stringify(board.tiles)
  }

  private static deserialize(serialized: string): IBoard {
    return { tiles: JSON.parse(serialized) }
  }

  static async save(board: IBoard) {
    try {
      const boardStringified = BoardDatabaseService.serialize(board)
      await AsyncStorage.setItem(BoardDatabaseService.key, boardStringified)
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)
    }
  }

  static async get(): Promise<IBoard | undefined> {
    try {
      const board = await AsyncStorage.getItem(BoardDatabaseService.key)
      if (board === null) return undefined

      return BoardDatabaseService.deserialize(board)
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)

      return undefined
    }
  }

  static async delete(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(BoardDatabaseService.key)
      return true
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)
      return false
    }
  }
}
