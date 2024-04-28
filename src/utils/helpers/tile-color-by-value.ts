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
    bg: '$cyan400',
    text: '$black',
  },
  32: {
    bg: '$cyan400',
    text: '$black',
  },
  64: {
    bg: '$cyan400',
    text: '$black',
  },
  128: {
    bg: '$cyan400',
    text: '$black',
  },
  256: {
    bg: '$cyan400',
    text: '$black',
  },
  512: {
    bg: '$cyan400',
    text: '$black',
  },
  1024: {
    bg: '$cyan400',
    text: '$black',
  },
  2048: {
    bg: '$cyan400',
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
