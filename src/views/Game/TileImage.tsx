import { Image } from '@gluestack-ui/themed'
import { memo } from 'react'

interface ITileImageProps {
  source: string
  alt: string
}

const TileImage = (props: Readonly<ITileImageProps>) => {
  return (
    <Image
      w="$full"
      h="$full"
      position="absolute"
      opacity="$10"
      source={props.source}
      alt={props.alt}
    />
  )
}

export default memo(TileImage)