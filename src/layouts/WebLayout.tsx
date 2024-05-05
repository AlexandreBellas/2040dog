import { BoardProvider } from '@contexts/BoardContext'
import {
  useMultiplayer,
  useMultiplayerDispatch,
} from '@contexts/MultiplayerContext'
import {
  Spinner,
  Input,
  InputField,
  Text,
  CloseIcon,
  Heading,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ShareIcon,
  Box,
  Image,
  View,
  ButtonText,
  Button,
  ButtonIcon,
  ButtonSpinner,
  Modal,
  ModalBackdrop,
  InputSlot,
  InputIcon,
} from '@gluestack-ui/themed'
import { IBoard } from '@interfaces/board'
import BoardDatabaseService from '@services/database/board.database'
import Board from '@views/Game/Board'
import { useEffect, useState } from 'react'
import { BrowserView, isBrowser } from 'react-device-detect'

export default function WebLayout() {
  // #region Contexts
  const { peerInstance, remotePlayerId, currPlayerId, remoteBoard } =
    useMultiplayer()
  const multiplayerDispatch = useMultiplayerDispatch()
  // #endregion

  // #region States
  const [board, setBoard] = useState<IBoard>()
  const [isLoading, setIsLoading] = useState(true)
  const [isConfiguringMultiplayer, setIsConfiguringMultiplayer] =
    useState(false)
  const [isConnectingToPlayer, setIsConnectingToPlayer] = useState(false)
  const [typeRemotePlayerId, setTypeRemotePlayerId] = useState('')
  const [hasConnectionError, setHasConnectionError] = useState(false)
  // #endregion

  // #region Effects
  useEffect(() => {
    peerInstance.on('connection', (conn) => {
      multiplayerDispatch({ type: 'set-connection', connection: conn })

      conn.on('open', () => {
        multiplayerDispatch({
          type: 'set-active-type',
          activeType: 'versus',
          remotePlayerId: conn.peer,
        })
      })

      conn.on('data', (data) => {
        if (typeof data === 'object' && data !== null && 'board' in data) {
          multiplayerDispatch({
            type: 'set-remote-board',
            board: data.board as IBoard,
          })
        }
      })

      conn.on('close', () => {
        multiplayerDispatch({ type: 'remove-connection' })
      })
    })
  }, [multiplayerDispatch, peerInstance, currPlayerId, typeRemotePlayerId])

  useEffect(() => {
    console.log('currPlayerId', currPlayerId)
    BoardDatabaseService.get().then((board) => {
      setBoard(board)
      setIsLoading(false)
    })
  }, [])
  // #endregion

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
          sx={{
            ...(isBrowser
              ? {
                  shadowColor: '$black',
                  shadowOffset: {
                    height: 2,
                    width: 1,
                  },
                  shadowRadius: '$1',
                  shadowOpacity: 0.4,
                }
              : {}),
          }}
        >
          <Board />
          <Button
            mt="$2"
            action="positive"
            isDisabled={isConfiguringMultiplayer}
            onPress={() => {
              setIsConfiguringMultiplayer(true)
            }}
          >
            {isConfiguringMultiplayer ? (
              <ButtonSpinner mr="$2" />
            ) : (
              <ButtonIcon as={ShareIcon} mr="$2" />
            )}
            <ButtonText>
              {isConfiguringMultiplayer
                ? 'Connecting to player...'
                : 'Multiplayer'}
            </ButtonText>
          </Button>
        </Box>
      </View>

      <Modal
        isOpen={isConfiguringMultiplayer}
        onClose={() => {
          setIsConfiguringMultiplayer(false)
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading>Connect to player</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Input
              variant="outline"
              size="md"
              isDisabled={isConnectingToPlayer}
              isInvalid={remotePlayerId === ''}
              isReadOnly={false}
            >
              <InputField
                placeholder="Insert player ID"
                onChange={(ev) => {
                  setTypeRemotePlayerId(ev.nativeEvent.text)
                }}
              />
              {isConnectingToPlayer && <Spinner size="small" m="$1" />}
            </Input>
            {hasConnectionError && (
              <Text>It was not possible to connect to peer.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              mr="$3"
              onPress={() => {
                setIsConfiguringMultiplayer(false)
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              action="positive"
              borderWidth="$0"
              isDisabled={isConnectingToPlayer}
              onPress={() => {
                if (typeRemotePlayerId === '') return

                setIsConnectingToPlayer(true)
                setHasConnectionError(false)

                peerInstance.connect(typeRemotePlayerId)
                peerInstance.on('error', () => {
                  setHasConnectionError(true)
                  setIsConnectingToPlayer(false)
                })
                peerInstance.on('open', () => {})
              }}
            >
              <ButtonText>Submit</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </BoardProvider>
  )
}
