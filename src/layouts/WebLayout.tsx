import { BoardProvider } from '@contexts/BoardContext'
import { Box, Image, View } from '@gluestack-ui/themed'
import Board from '@views/Game/Board'

export default function WebLayout() {
  return (
    <BoardProvider>
      <View h="$full" w="$full" alignItems="center">
        <Image
          w="$full"
          h="$full"
          position="absolute"
          source={require('@assets/background.png')}
          resizeMode="cover"
          opacity="$20"
        />
        <Box
          backgroundColor="$white"
          borderRadius="$2xl"
          borderWidth="$4"
          borderColor="$white"
          p="$8"
        >
          <Board />
        </Box>
      </View>
    </BoardProvider>
  )
}
