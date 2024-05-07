import AsyncStorage from '@react-native-async-storage/async-storage'

export default class MultiplayerDatabaseService {
  private static idKey = 'multiplayer-id'

  static async setId(id: string) {
    try {
      await AsyncStorage.setItem(MultiplayerDatabaseService.idKey, id)
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)
    }
  }

  static async getId(): Promise<string | undefined> {
    try {
      const id = await AsyncStorage.getItem(MultiplayerDatabaseService.idKey)
      if (id === null) return undefined

      return id
    } catch (e) {
      if (e instanceof Error) console.debug(e.message)

      return undefined
    }
  }
}
