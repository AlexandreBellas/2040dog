import { Image } from '@gluestack-ui/themed'
import { BrowserView } from 'react-device-detect'

export default function Background() {
  return (
    <BrowserView renderWithFragment>
      <Image
        w="$full"
        h="$full"
        position="absolute"
        source={require('@assets/background.png')}
        resizeMode="cover"
        opacity="$20"
        alt="background"
      />
    </BrowserView>
  )
}
