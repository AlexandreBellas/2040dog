import { config } from '@gluestack-ui/config' // Optional if you want to use default theme
import { Box, GluestackUIProvider, Text } from '@gluestack-ui/themed'

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <Box
        width="100%"
        justifyContent="center"
        alignItems="center"
        backgroundColor="black"
      >
        <Text color="white">Open up App.js to start working on your app!!</Text>
      </Box>
    </GluestackUIProvider>
  )
}
