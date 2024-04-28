import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import WebLayout from '@layouts/WebLayout'
import { Platform } from 'react-native'

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      {Platform.OS === 'web' && <WebLayout />}
    </GluestackUIProvider>
  )
}
