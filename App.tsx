import MultiplayerProvider from '@contexts/MultiplayerContext'
import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import WebLayout from '@layouts/WebLayout'
import { VersionDatabaseService } from '@services/database/version.database'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import 'react-native-gesture-handler'

export default function App() {
  // #region States
  const [isValidatingVersion, setIsValidatingVersion] = useState(true)
  // #endregion

  // #region Effects
  useEffect(() => {
    const versionPromise = VersionDatabaseService.validate()

    Promise.allSettled([versionPromise]).then(() => {
      setIsValidatingVersion(false)
    })
  }, [])
  // #endregion

  if (isValidatingVersion) return <></>

  return (
    <GluestackUIProvider config={config}>
      {Platform.OS === 'web' ? <WebLayout /> : <></>}
    </GluestackUIProvider>
  )
}
