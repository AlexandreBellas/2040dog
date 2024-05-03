import { BoardProvider } from '@contexts/BoardContext'
import { Box, Image, View } from '@gluestack-ui/themed'
import { IBoard } from '@interfaces/board'
import BoardDatabaseService from '@services/database/board.database'
import Board from '@views/Game/Board'
import { useEffect, useState } from 'react'
import { BrowserView } from 'react-device-detect'

export default function WebLayout() {
  const [board, setBoard] = useState<IBoard>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    BoardDatabaseService.get().then((board) => {
      setBoard(board)
      setIsLoading(false)
    })
  }, [])

  if (isLoading && !board) return <></>

  return (
    <BoardProvider board={board}>
      <View h="$full" w="$full" alignItems="center">
        <BrowserView renderWithFragment>
          <Image
            w="$full"
            h="$full"
            position="absolute"
            source={require('@assets/background.png')}
            resizeMode="cover"
            opacity="$20"
          />
        </BrowserView>
        <Box
          backgroundColor="$white"
          borderRadius="$2xl"
          borderWidth="$4"
          borderColor="$white"
          p="$4"
        >
          <Board />
        </Box>
      </View>
    </BoardProvider>
  )
}
