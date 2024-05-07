import AsyncStorage from '@react-native-async-storage/async-storage'

export default class PointsDatabaseService {
  private static currScoreKey = 'curr-score'
  private static highestScoreKey = 'highest-score'

  static async setCurrScore(points: number) {
    try {
      await AsyncStorage.setItem(
        PointsDatabaseService.currScoreKey,
        String(points),
      )
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)
    }
  }

  static async getCurrScore(): Promise<number | undefined> {
    try {
      const currScore = await AsyncStorage.getItem(
        PointsDatabaseService.currScoreKey,
      )
      if (currScore === null || isNaN(Number(currScore))) return undefined

      return Number(currScore)
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)

      return undefined
    }
  }

  static async setHighestScore(highestScore: number) {
    try {
      await AsyncStorage.setItem(
        PointsDatabaseService.highestScoreKey,
        String(highestScore),
      )
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)
    }
  }

  static async getHighestScore(): Promise<number | undefined> {
    try {
      const highestScore = await AsyncStorage.getItem(
        PointsDatabaseService.highestScoreKey,
      )
      if (highestScore === null || isNaN(Number(highestScore))) return undefined

      return Number(highestScore)
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)

      return undefined
    }
  }
}
