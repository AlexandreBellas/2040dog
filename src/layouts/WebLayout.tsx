import { BoardProvider } from '@contexts/BoardContext'
import Board from '@views/Game/Board'

export default function WebLayout() {
  return (
    <BoardProvider>
      <Board />
    </BoardProvider>
  )
}
