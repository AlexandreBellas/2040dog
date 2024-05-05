import { BoardProvider } from '@contexts/BoardContext'
import MultiplayerProvider from '@contexts/MultiplayerContext'
import { IBoard } from '@interfaces/board'
import BoardDatabaseService from '@services/database/board.database'
import MainPage from '@views/Game/MainPage'
import { useEffect, useState } from 'react'

export default function WebLayout() {
  // #region States
  const [board, setBoard] = useState<IBoard>()
  const [isLoading, setIsLoading] = useState(true)
  // #endregion

  // #region Effects
  useEffect(() => {
    BoardDatabaseService.get().then((board) => {
      setBoard(board)
      setIsLoading(false)
    })
  }, [])
  // #endregion

  if (isLoading && !board) return <></>

  return (
    <BoardProvider board={board}>
      <MultiplayerProvider>
        <MainPage />
      </MultiplayerProvider>
    </BoardProvider>
  )
}
