import { AnimatedView } from '@gluestack-style/animation-resolver'
import { Box, Text, styled } from '@gluestack-ui/themed'
import tileColorByValue from '@helpers/tile-color-by-value'
import { memo, useEffect, useMemo, useState } from 'react'

import TileImage from './TileImage'

interface ITileProps {
  i: number
  j: number
  value?: number | null
  hasBeenCombined: boolean
  isNew: boolean
}

const Tile = (props: Readonly<ITileProps>) => {
  // #region Props
  const { value, hasBeenCombined, isNew, i, j } = props
  // #endregion

  // #region Constant variables
  const isNewAnimationDuration = 150
  const combinedAnimationDuration = 100
  const bgColorNull = '$trueGray300'
  // #endregion

  // #region States
  const [isNewAnimationState, setIsNewAnimationState] = useState(0)
  const [combinedAnimationState, setCombinedAnimationState] = useState(0)
  // #endregion

  // #region Hooks
  const { bgColor, textColor, image } = useMemo(
    () =>
      value
        ? tileColorByValue(value)
        : { bgColor: bgColorNull, textColor: bgColorNull },
    [value],
  )
  const startScale = useMemo(() => {
    if (isNewAnimationState === 1) return '0%'

    if (combinedAnimationState === 0) return '100%'
    return combinedAnimationState === 1 ? '100%' : '115%'
  }, [isNewAnimationState, combinedAnimationState])
  const stopScale = useMemo(() => {
    if (isNewAnimationState === 1) return '100%'

    if (combinedAnimationState === 0) return '100%'
    return combinedAnimationState === 1 ? '115%' : '100%'
  }, [isNewAnimationState, combinedAnimationState])
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
    if (hasBeenCombined) setCombinedAnimationState(1)
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
    minHeight: '$16',
    minWidth: '$16',
    maxHeight: '$80',
    maxWidth: '$80',
    backgroundColor: bgColorNull,
    ':initial': { scale: startScale },
    ':animate': { scale: stopScale },
    ':transition': {
      scale: {
        duration:
          isNewAnimationState === 1
            ? isNewAnimationDuration
            : combinedAnimationDuration,
        type: 'linear',
        ease: 'easeOut',
      },
    },
  })
  // #endregion

  if (isNew && isNewAnimationState === 0) {
    return (
      <Box backgroundColor={bgColorNull} borderRadius="$md">
        <AnimatedBox
          key={`${i}-${j}`}
          backgroundColor={bgColorNull}
          borderRadius="$md"
          alignItems="center"
          justifyContent="center"
        >
          <Text />
        </AnimatedBox>
      </Box>
    )
  }

  return (
    <Box backgroundColor={bgColorNull} borderRadius="$md">
      <AnimatedBox
        key={`${i}-${j}`}
        backgroundColor={bgColor}
        borderRadius="$md"
        alignItems="center"
        justifyContent="center"
      >
        {image && <TileImage source={image.source} alt={image.alt} />}
        <Text color={textColor} fontSize="$3xl" fontWeight="$bold">
          {value}
        </Text>
      </AnimatedBox>
    </Box>
  )
}

export default memo(Tile, (prev, next) => {
  if (prev.isNew && !next.isNew && prev.value === next.value) return true

  return (
    prev.hasBeenCombined === next.hasBeenCombined &&
    prev.value === next.value &&
    prev.isNew === next.isNew &&
    prev.i === next.i &&
    prev.j === next.j
  )
})
