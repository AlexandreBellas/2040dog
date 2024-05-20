import { memo } from 'react'
import { Image } from 'react-native'

interface ITileImageProps {
  image?: {
    source: any
    alt: string
  }
}

const TileImage = (props: Readonly<ITileImageProps>) => {
  // #region Props
  const { image } = props
  // #endregion

  return (
    <Image
      source={image?.source}
      alt={image?.alt}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 8,
        position: 'absolute',
        opacity: 0.3,
      }}
    />
  )
}

export default memo(TileImage)
