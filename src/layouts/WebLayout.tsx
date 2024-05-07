import { BoardProvider } from '@contexts/BoardContext'
import MultiplayerProvider from '@contexts/MultiplayerContext'
import { IBoard } from '@interfaces/board'
import BoardDatabaseService from '@services/database/board.database'
import MultiplayerDatabaseService from '@services/database/multiplayer.database'
import MainPage from '@views/Game/MainPage'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function WebLayout() {
  // #region States
  const [currPlayerId, setCurrPlayerId] = useState<string | null>(null)
  const [board, setBoard] = useState<IBoard>()
  const [isLoading, setIsLoading] = useState(true)
  // #endregion

  // #region Effects
  useEffect(() => {
    const promiseBoard = BoardDatabaseService.get().then((board) => {
      setBoard(board)
    })

    const promiseMultiplayer = MultiplayerDatabaseService.getId().then((id) => {
      if (id !== undefined) {
        setCurrPlayerId(id)
        return
      }

      const newId = `2040dog-${uuidv4()}`
      setCurrPlayerId(newId)
      MultiplayerDatabaseService.setId(newId)
    })

    Promise.allSettled([promiseBoard, promiseMultiplayer]).then(() => {
      setIsLoading(false)
    })
  }, [])
  // #endregion

  if (isLoading && (!board || !currPlayerId)) return <></>

  return (
    <BoardProvider board={board}>
      <MultiplayerProvider currPlayerId={currPlayerId!}>
        <MainPage />
      </MultiplayerProvider>
    </BoardProvider>
  )
}
