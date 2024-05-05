import MultiplayerProvider from '@contexts/MultiplayerContext'
import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import WebLayout from '@layouts/WebLayout'
import { Platform } from 'react-native'
import 'react-native-gesture-handler'

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      {Platform.OS === 'web' ? <WebLayout /> : <></>}
    </GluestackUIProvider>
  )
}
