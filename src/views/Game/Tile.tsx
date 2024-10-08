import { AnimatedView } from '@gluestack-style/animation-resolver'
import { Text, styled } from '@gluestack-ui/themed'
import tileColorByValue from '@helpers/tile-color-by-value'
import usePrevProps from '@hooks/use-prev-props'
import { IPosition } from '@interfaces/position'
import { ITile } from '@interfaces/tile'
import {
  combinedAnimationDuration,
  expandTileOnWinMomentAnimationDuration,
  isNewAnimationDuration,
  moveAnimationDuration,
} from '@utils/constants/animation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'

import TileImage from './TileImage'

interface ITileProps {
  i: number
  j: number
  tile: ITile
}

const Tile = ({ tile, i, j }: Readonly<ITileProps>) => {
  // #region Props
  const { isCombined: hasBeenCombined, isNew, value } = tile
  // #endregion

  // #region Constant variables
  const bgColorNull = '$trueGray300'
  const tileTotalLength = (1 + 16 + 1) * 4
  // #endregion

  // #region States
  const [isNewAnimationState, setIsNewAnimationState] = useState(0)
  const [combinedAnimationState, setCombinedAnimationState] = useState(0)
  const [hasDismissedWin, setHasDismissedWin] = useState(false)
  // #endregion

  // #region Memos
  const { bgColor, textColor, image } = useMemo(
    () =>
      value
        ? tileColorByValue(value)
        : { bgColor: bgColorNull, textColor: bgColorNull },
    [value],
  )
  const startScale = useMemo(() => {
    if (value === 2048) return hasDismissedWin ? '400%' : '100%'
    if (isNewAnimationState === 1) return '0%'

    if (combinedAnimationState === 0) return '100%'
    return combinedAnimationState === 1 ? '100%' : '115%'
  }, [value, hasDismissedWin, isNewAnimationState, combinedAnimationState])
  const stopScale = useMemo(() => {
    if (value === 2048) return hasDismissedWin ? '100%' : '400%'
    if (isNewAnimationState === 1) return '100%'

    if (combinedAnimationState === 0) return '100%'
    return combinedAnimationState === 1 ? '115%' : '100%'
  }, [value, hasDismissedWin, isNewAnimationState, combinedAnimationState])

  const positionTransitionDuration = useMemo(() => {
    return tile.value === 2048
      ? expandTileOnWinMomentAnimationDuration
      : moveAnimationDuration
  }, [tile])
  // #endregion

  // #region Prev props
  const previousPosition = usePrevProps<IPosition>({ i, j })
  // #endregion

  // #region Callbacks
  const positionToPixels = useCallback(
    (position: number) => position * tileTotalLength,
    [tileTotalLength],
  )
  // #endregion

  // #region Effects

  // onNew
  useEffect(() => {
    if (isNew && value) setIsNewAnimationState(1)
  }, [isNew, value])

  // onNewAnimation
  useEffect(() => {
    if (isNewAnimationState === 0) return

    if (isNewAnimationState === 1) {
      setTimeout(() => {
        if (isNew) setIsNewAnimationState(2)
      }, isNewAnimationDuration)
    }
  }, [isNew, isNewAnimationState])

  // onCombined
  useEffect(() => {
    if (hasBeenCombined) {
      setTimeout(() => setCombinedAnimationState(1), moveAnimationDuration)
    }
  }, [hasBeenCombined])

  // onCombinedAnimation
  useEffect(() => {
    if (combinedAnimationState === 0) return

    if (combinedAnimationState === 1) {
      setTimeout(() => {
        setCombinedAnimationState(2)
      }, combinedAnimationDuration)
    }

    if (combinedAnimationState === 2) {
      setTimeout(() => {
        setCombinedAnimationState(0)
      }, combinedAnimationDuration)
    }
  }, [combinedAnimationState])

  // #endregion

  // #region Styled components
  const AnimatedBox = styled(AnimatedView, {
    position: 'absolute',
    h: '$16',
    w: '$16',
    margin: '$1',
    backgroundColor: bgColorNull,
    borderRadius: '$md',
    ':initial': {
      x:
        tile.value === 2048 && hasDismissedWin
          ? 1.5 * tileTotalLength
          : positionToPixels(previousPosition?.j ?? j),
      y:
        tile.value === 2048 && hasDismissedWin
          ? 1.5 * tileTotalLength
          : positionToPixels(previousPosition?.i ?? i),
      scale: startScale,
    },
    ':animate': {
      x:
        tile.value === 2048 && !hasDismissedWin
          ? 1.5 * tileTotalLength
          : positionToPixels(j),
      y:
        tile.value === 2048 && !hasDismissedWin
          ? 1.5 * tileTotalLength
          : positionToPixels(i),
      scale: stopScale,
    },
    ':transition': {
      x: {
        duration: positionTransitionDuration,
        ease: 'easeIn',
      },
      y: {
        duration: positionTransitionDuration,
        ease: 'easeIn',
      },
      scale: {
        duration:
          tile.value === 2048
            ? expandTileOnWinMomentAnimationDuration
            : isNewAnimationState === 1
              ? isNewAnimationDuration
              : combinedAnimationDuration,
        type: 'linear',
        ease: tile.value === 2048 ? 'easeIn' : 'easeOut',
      },
    },
  })
  // #endregion

  if (isNew && isNewAnimationState === 0) {
    return (
      <AnimatedBox
        key={`${i}-${j}`}
        backgroundColor={bgColorNull}
        alignItems="center"
        justifyContent="center"
        zIndex={value === 2048 ? 100 : 0}
      >
        <Text />
      </AnimatedBox>
    )
  }

  return (
    <TouchableOpacity
      disabled={value !== 2048 || hasDismissedWin}
      onPress={() => {
        setHasDismissedWin(true)
      }}
      style={{ zIndex: value === 2048 ? 100 : 0 }}
    >
      <AnimatedBox
        backgroundColor={bgColor}
        alignItems="center"
        justifyContent="center"
      >
        <TileImage image={image} />
        <Text
          color={textColor}
          fontSize={value && value >= 1024 ? '$xl' : '$3xl'}
          fontWeight="$bold"
        >
          {value}
        </Text>
      </AnimatedBox>
    </TouchableOpacity>
  )
}

export default memo(Tile, (prev, next) => {
  if (
    prev.tile.isNew &&
    !next.tile.isNew &&
    prev.tile.value === next.tile.value
  ) {
    return true
  }

  return (
    prev.tile.isCombined === next.tile.isCombined &&
    prev.tile.value === next.tile.value &&
    prev.tile.isNew === next.tile.isNew &&
    prev.i === next.i &&
    prev.j === next.j
  )
})
