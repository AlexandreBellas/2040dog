import { Box, Text } from '@gluestack-ui/themed'
import { memo } from 'react'

const BackgroundTile = () => {
  return (
    <Box
      backgroundColor="$trueGray300"
      borderRadius="$md"
      h="$16"
      w="$16"
      margin="$1"
    >
      <Text />
    </Box>
  )
}

export default memo(BackgroundTile)
