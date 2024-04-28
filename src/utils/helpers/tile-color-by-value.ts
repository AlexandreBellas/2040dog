import { IColor } from '@interfaces/colors'

interface ITileColors {
  bg: IColor
  text: IColor
}

const valueColorMap: Record<number, ITileColors> = {
  2: {
    bg: '$coolGray200',
    text: '$black',
  },
  4: {
    bg: '$coolGray400',
    text: '$black',
  },
  8: {
    bg: '$coolGray600',
    text: '$white',
  },
  16: {
    bg: '$orange200',
    text: '$black',
  },
  32: {
    bg: '$red400',
    text: '$black',
  },
  64: {
    bg: '#635e53',
    text: '$white',
  },
  128: {
    bg: '#523f15',
    text: '$white',
  },
  256: {
    bg: '$green400',
    text: '$black',
  },
  512: {
    bg: '$cyan200',
    text: '$black',
  },
  1024: {
    bg: '$indigo300',
    text: '$black',
  },
  2048: {
    bg: '$yellow300',
    text: '$black',
  },
}

export default function tileColorByValue(value?: number | null): ITileColors {
  if (typeof value !== 'number') {
    return { bg: '$trueGray300', text: '$trueGray300' }
  }

  const color = valueColorMap[value]
  if (!color) throw new Error(`Invalid value: "${value}".`)

  return color
}
