import { IBoard } from '@interfaces/board'
import Peer, { DataConnection } from 'peerjs'
import React, { createContext, useContext, useReducer } from 'react'

// #region Context types
interface IMultiplayerProviderProps {
  children: JSX.Element
  currPlayerId: string
}

interface IMultiplayerContextState {
  peerInstance: Peer
  peerConnection?: DataConnection
  activeType: 'single' | 'versus' | 'co-op'
  currPlayerId: string
  remotePlayerId?: string
  remoteBoard?: IBoard
  remoteIsGameOver?: boolean
  remoteHasWon?: boolean
}

type IMultiplayerContextAction =
  | {
      type: 'set-active-type'
      activeType: 'versus' | 'co-op'
      remotePlayerId: string
      connection?: DataConnection
    }
  | {
      type: 'set-active-type'
      activeType: 'single'
    }
  | {
      type: 'set-connection'
      connection: DataConnection
    }
  | {
      type: 'remove-connection'
    }
  | {
      type: 'set-remote-board'
      board: IBoard
      isGameOver: boolean
      hasWon: boolean
    }
// #endregion

// #region Context definitions
export const MultiplayerContext = createContext({} as IMultiplayerContextState)
export const MultiplayerContextDispatch = createContext(
  {} as React.Dispatch<IMultiplayerContextAction>,
)
// #endregion

// #region Hook definitions
export const useMultiplayer = () => useContext(MultiplayerContext)
export const useMultiplayerDispatch = () =>
  useContext(MultiplayerContextDispatch)
// #endregion

// #region Functions

// #endregion

// #region Provider definitions
export default function MultiplayerProvider({
  children,
  currPlayerId,
}: Readonly<IMultiplayerProviderProps>) {
  const peer = new Peer(currPlayerId, {
    config: {
      iceServers: [
        {
          urls: 'turn:global.relay.metered.ca:80',
          username: 'fad8157c3c3294f670891975',
          credential: 'VCQqHCzv9xZqG+Y/',
        },
      ],
    },
  })

  const initialState: IMultiplayerContextState = {
    activeType: 'single',
    currPlayerId,
    peerInstance: peer,
  }

  const [state, dispatch] = useReducer(multiplayerReducer, initialState)

  return (
    <MultiplayerContext.Provider value={state}>
      <MultiplayerContextDispatch.Provider value={dispatch}>
        {children}
      </MultiplayerContextDispatch.Provider>
    </MultiplayerContext.Provider>
  )
}
// #endregion

// #region Reducer definitions
function multiplayerReducer(
  state: IMultiplayerContextState,
  action: IMultiplayerContextAction,
): IMultiplayerContextState {
  switch (action.type) {
    case 'set-active-type': {
      if (action.activeType === 'single') {
        return {
          ...state,
          activeType: 'single',
          remotePlayerId: undefined,
        }
      }

      return {
        ...state,
        activeType: action.activeType,
        remotePlayerId: action.remotePlayerId,
        peerConnection: action.connection ?? state.peerConnection,
      }
    }
    case 'set-connection': {
      if (state.activeType === 'single') return state

      return {
        ...state,
        peerConnection: action.connection,
      }
    }
    case 'remove-connection': {
      return {
        ...state,
        peerConnection: undefined,
      }
    }
    case 'set-remote-board': {
      if (state.activeType === 'single') return state

      return {
        ...state,
        remoteBoard: action.board,
        remoteHasWon: action.hasWon,
        remoteIsGameOver: action.isGameOver,
      }
    }
    default: {
      return state
    }
  }
}
// #endregion
