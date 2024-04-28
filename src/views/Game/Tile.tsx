import { Box, Text } from '@gluestack-ui/themed'
import tileColorByValue from '@helpers/tile-color-by-value'
import { useMemo } from 'react'

interface ITileProps {
  value?: number | null
}

export default function Tile(props: Readonly<ITileProps>) {
  const { value } = props

  const { bg, text } = useMemo(() => tileColorByValue(value), [value])

  return (
    <Box
      borderRadius="$md"
      backgroundColor={bg}
      minHeight="$24"
      minWidth="$24"
      maxHeight="$80"
      maxWidth="$80"
      alignItems="center"
      justifyContent="center"
    >
      <Text color={text} fontSize="$4xl" fontWeight="$bold">
        {value}
      </Text>
    </Box>
  )
}
