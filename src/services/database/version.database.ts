import AsyncStorage from "@react-native-async-storage/async-storage"
import { version } from "@utils/constants/version"
import BoardDatabaseService from "./board.database"

export class VersionDatabaseService {
    private static versionKey = 'version'

    static async validate() {
        try {
            const currVersion = await AsyncStorage.getItem(VersionDatabaseService.versionKey)
            if (currVersion !== version) {
                await BoardDatabaseService.delete()
                await AsyncStorage.setItem(VersionDatabaseService.versionKey, version)
            }
        } catch (e) {
            if (e instanceof Error) console.debug(e.message)
        }
    }
}