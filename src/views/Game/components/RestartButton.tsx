import { useBoardDispatch } from '@contexts/BoardContext'
import { Button, ButtonIcon } from '@gluestack-ui/themed'
import { RotateCcw } from 'lucide-react-native'
import { Alert, Platform } from 'react-native'

export default function RestartButton() {
  // #region Contexts
  const boardDispatch = useBoardDispatch()
  // #endregion

  return (
    <Button
      size="md"
      variant="outline"
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
  )
}
