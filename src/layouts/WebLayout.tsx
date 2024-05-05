import { BoardProvider } from '@contexts/BoardContext'
import { IBoard } from '@interfaces/board'
import BoardDatabaseService from '@services/database/board.database'
import MainPage from '@views/Game/MainPage'
import { useEffect, useState } from 'react'

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
      <MainPage/>
    </BoardProvider>
  )
}
