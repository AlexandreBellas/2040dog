import { useBoard, useBoardDispatch } from '@contexts/BoardContext'
import {
  Box,
  Button,
  ButtonIcon,
  HStack,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
import { RotateCcw } from 'lucide-react-native'
import { Alert, Platform } from 'react-native'

import Tile from './Tile'

export default function Board() {
  // #region Contexts
  const { board } = useBoard()
  const boardDispatch = useBoardDispatch()
  // #endregion

  // #region Constant values
  const space = 'md'
  // #endregion

  return (
      <Box alignItems="center" width="$full">
        <View w="$full" alignItems="flex-end">
          <Button
            size="md"
            variant="outline"
            borderRadius="$lg"
            borderWidth="$2"
            action="secondary"
            isFocusVisible={false}
            onPress={() => {
              const confirmationTitle = 'Are you sure?'
              const confirmationMessage = 'Your progress will be lost. 🦴'
              if (Platform.OS === 'web') {
                if (confirm(`${confirmationTitle} ${confirmationMessage}`)) {
                  boardDispatch({ type: 'restart' })
                }

                return
              }

              Alert.alert(confirmationTitle, confirmationMessage, [
                {
                  text: 'No',
                },
                {
                  text: 'Restart',
                  onPress: () => {
                    boardDispatch({ type: 'restart' })
                  },
                },
              ])
            }}
          >
            <ButtonIcon as={RotateCcw} />
          </Button>
        </View>
        <Text fontFamily="$heading" fontSize="$6xl">
          2040🐶
        </Text>
        <Text>(only some dogs)</Text>
        <VStack
          borderRadius={`$${space}`}
          borderColor="#bbada0"
          borderWidth="$8"
          space={space}
          backgroundColor="#bbada0"
          marginTop="$2"
        >
          {board.tiles.map((row, rowIdx) => (
            <HStack key={`tiles-row-${row.toString()}-${rowIdx}`} space={space}>
              {row.map((tile, columnIdx) => (
                <Tile
                  key={`tiles-column-${rowIdx}-${columnIdx}`}
                  i={rowIdx}
                  j={columnIdx}
                  value={tile.value}
                  hasBeenCombined={tile.isCombined}
                  isNew={tile.isNew}
                />
              ))}
            </HStack>
          ))}
        </VStack>
      </Box>
  )
}
