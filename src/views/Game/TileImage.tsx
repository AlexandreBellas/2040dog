import { Image } from '@gluestack-ui/themed'
import { memo } from 'react'

interface ITileImageProps {
  source: string
  alt: string
}

const TileImage = (props: Readonly<ITileImageProps>) => {
  return (
    <Image
      borderRadius={8}
      w="$full"
      h="$full"
      position="absolute"
      opacity="$30"
      source={props.source}
      alt={props.alt}
    />
  )
}

export default memo(TileImage)
