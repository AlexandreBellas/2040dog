import { Box, Image, Text } from '@gluestack-ui/themed'
import tileColorByValue from '@helpers/tile-color-by-value'
import { useMemo } from 'react'

interface ITileProps {
  value?: number | null
}

export default function Tile(props: Readonly<ITileProps>) {
  const { value } = props

  const { bgColor, textColor, imageUri } = useMemo(
    () => tileColorByValue(value),
    [value],
  )

  return (
    <Box
      borderRadius="$md"
      backgroundColor={bgColor}
      minHeight="$20"
      minWidth="$20"
      maxHeight="$80"
      maxWidth="$80"
      alignItems="center"
      justifyContent="center"
    >
      {imageUri && (
        <Image
          w="$full"
          h="$full"
          position="absolute"
          opacity="$20"
          source={imageUri}
        />
      )}
      <Text color={textColor} fontSize="$3xl" fontWeight="$bold">
        {value}
      </Text>
    </Box>
  )
}
