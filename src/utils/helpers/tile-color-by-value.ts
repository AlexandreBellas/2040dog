import { IColor } from '@interfaces/colors'

interface ITileStyle {
  bgColor: IColor
  textColor: IColor
  image?: {
    source: string
    alt: string
  }
}

export const styleMap: Record<number, ITileStyle> = {
  2: {
    bgColor: '$coolGray200',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/2.png'),
      alt: 'Yorkshire',
    },
  },
  4: {
    bgColor: '$coolGray400',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/4.png'),
      alt: 'Brazilian terrier',
    },
  },
  8: {
    bgColor: '$coolGray600',
    textColor: '$white',
    image: {
      source: require('@assets/dogs/8.png'),
      alt: 'Beagle',
    },
  },
  16: {
    bgColor: '$orange200',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/16.png'),
      alt: 'Daschund',
    },
  },
  32: {
    bgColor: '$red200',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/32.png'),
      alt: 'Corgi',
    },
  },
  64: {
    bgColor: '#635e53',
    textColor: '$white',
    image: {
      source: require('@assets/dogs/64.jpg'),
      alt: 'Bulldog',
    },
  },
  128: {
    bgColor: '#ab8738',
    textColor: '$white',
    image: {
      source: require('@assets/dogs/128.jpeg'),
      alt: 'Golden retriever',
    },
  },
  256: {
    bgColor: '$green400',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/256.png'),
      alt: 'Doberman',
    },
  },
  512: {
    bgColor: '$cyan200',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/512.jpeg'),
      alt: 'Husky',
    },
  },
  1024: {
    bgColor: '$indigo300',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/1024.png'),
      alt: 'German shepherd',
    },
  },
  2048: {
    bgColor: '$yellow100',
    textColor: '$black',
    image: {
      source: require('@assets/dogs/2048.jpg'),
      alt: 'Fubá',
    },
  },
}

export default function tileColorByValue(value: number): ITileStyle {
  const color = styleMap[value]
  if (!color) throw new Error(`Invalid value: "${value}".`)

  return color
}
