import { IBoard } from '@interfaces/board'
import Peer, { DataConnection } from 'peerjs'
import React, { createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

// #region Context types
interface IMultiplayerProviderProps {
  children: JSX.Element
}

interface IMultiplayerContextState {
  peerInstance: Peer
  peerConnection?: DataConnection
  activeType: 'single' | 'versus' | 'co-op'
  currPlayerId: string
  remotePlayerId?: string
  remoteBoard?: IBoard
}

type IMultiplayerContextAction =
  | {
      type: 'set-active-type'
      activeType: 'versus' | 'co-op'
      remotePlayerId: string
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
}: Readonly<IMultiplayerProviderProps>) {
  const currPlayerId = uuidv4()
  const peer = new Peer(currPlayerId)

  const initialState: IMultiplayerContextState = {
    activeType: 'single',
    currPlayerId,
    peerInstance: peer,
    remotePlayerId: undefined,
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
      }
    }
    default: {
      return state
    }
  }
}
// #endregion
