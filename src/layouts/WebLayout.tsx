import { BoardProvider } from '@contexts/BoardContext'
import MultiplayerProvider from '@contexts/MultiplayerContext'
import { IBoard } from '@interfaces/board'
import BoardDatabaseService from '@services/database/board.database'
import MultiplayerDatabaseService from '@services/database/multiplayer.database'
import PointsDatabaseService from '@services/database/points.database'
import MainPage from '@views/Game/MainPage'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function WebLayout() {
  // #region States
  const [currPlayerId, setCurrPlayerId] = useState<string | null>(null)
  const [board, setBoard] = useState<IBoard>()
  const [currScore, setCurrScore] = useState<number>(0)
  const [highestScore, setHighestScore] = useState<number>(0)
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

    const promiseCurrScore = PointsDatabaseService.getCurrScore().then(
      (currScore) => {
        if (currScore !== undefined) {
          setCurrScore(currScore)
        } else {
          PointsDatabaseService.setCurrScore(0)
        }
      },
    )

    const promiseHighestScore = PointsDatabaseService.getHighestScore().then(
      (highestScore) => {
        if (highestScore !== undefined) {
          setHighestScore(highestScore)
        } else {
          PointsDatabaseService.setHighestScore(0)
        }
      },
    )

    Promise.allSettled([
      promiseBoard,
      promiseMultiplayer,
      promiseCurrScore,
      promiseHighestScore,
    ]).then(() => {
      setIsLoading(false)
    })
  }, [])
  // #endregion

  if (isLoading && (!board || !currPlayerId)) return <></>

  return (
    <BoardProvider
      board={board}
      currScore={currScore}
      highestScore={highestScore}
    >
      <MultiplayerProvider currPlayerId={currPlayerId!}>
        <MainPage />
      </MultiplayerProvider>
    </BoardProvider>
  )
}
