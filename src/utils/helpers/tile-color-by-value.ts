import { IColor } from '@interfaces/colors'

interface ITileStyle {
  bgColor: IColor
  textColor: IColor
  imageUri?: string
}

const styleMap: Record<number, ITileStyle> = {
  2: {
    bgColor: '$coolGray200',
    textColor: '$black',
    imageUri: require('@assets/dogs/2.png'),
  },
  4: {
    bgColor: '$coolGray400',
    textColor: '$black',
    imageUri: require('@assets/dogs/4.png'),
  },
  8: {
    bgColor: '$coolGray600',
    textColor: '$white',
  },
  16: {
    bgColor: '$orange200',
    textColor: '$black',
  },
  32: {
    bgColor: '$red400',
    textColor: '$black',
  },
  64: {
    bgColor: '#635e53',
    textColor: '$white',
  },
  128: {
    bgColor: '#523f15',
    textColor: '$white',
  },
  256: {
    bgColor: '$green400',
    textColor: '$black',
  },
  512: {
    bgColor: '$cyan200',
    textColor: '$black',
  },
  1024: {
    bgColor: '$indigo300',
    textColor: '$black',
  },
  2048: {
    bgColor: '$yellow300',
    textColor: '$black',
  },
}

export default function tileColorByValue(value?: number | null): ITileStyle {
  if (typeof value !== 'number') {
    return { bgColor: '$trueGray300', textColor: '$trueGray300' }
  }

  const color = styleMap[value]
  if (!color) throw new Error(`Invalid value: "${value}".`)

  return color
}
