import { AnimatedView } from '@gluestack-style/animation-resolver'
import { Text, styled } from '@gluestack-ui/themed'
import tileColorByValue from '@helpers/tile-color-by-value'
import { memo, useEffect, useMemo, useState } from 'react'

import TileImage from './TileImage'

interface ITileProps {
  i: number
  j: number
  value?: number | null
  hasBeenCombined: boolean
}

const Tile = (props: Readonly<ITileProps>) => {
  // #region Props
  const { value, hasBeenCombined, i, j } = props
  // #endregion

  // #region Constant variables
  const animationDuration = 100
  // #endregion

  // #region States
  const [combinedAnimationState, setCombinedAnimationState] = useState(0)
  // #endregion

  // #region Hooks
  const { bgColor, textColor, image } = useMemo(
    () => tileColorByValue(value),
    [value],
  )
  const startScale = useMemo(() => {
    if (combinedAnimationState === 0) return '100%'
    return combinedAnimationState === 1 ? '100%' : '115%'
  }, [combinedAnimationState])
  const stopScale = useMemo(() => {
    if (combinedAnimationState === 0) return '100%'
    return combinedAnimationState === 1 ? '115%' : '100%'
  }, [combinedAnimationState])
  // #endregion

  // #region Effects

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
      }, animationDuration)
    }

    if (combinedAnimationState === 2) {
      setTimeout(() => {
        setCombinedAnimationState(0)
      }, animationDuration)
    }
  }, [combinedAnimationState])

  // #endregion

  // #region Styled components
  const Box = styled(AnimatedView, {
    minHeight: '$20',
    minWidth: '$20',
    maxHeight: '$80',
    maxWidth: '$80',
    ':initial': { scale: startScale },
    ':animate': { scale: stopScale },
    ':transition': {
      scale: {
        duration: animationDuration,
        type: 'linear',
        ease: 'easeOut',
      },
    },
  })
  // #endregion

  return (
    <Box
      key={`${i}-${j}`}
      borderRadius="$md"
      backgroundColor={bgColor}
      alignItems="center"
      justifyContent="center"
    >
      {image && <TileImage source={image.source} alt={image.alt} />}
      <Text color={textColor} fontSize="$3xl" fontWeight="$bold">
        {value}
      </Text>
    </Box>
  )
}

export default memo(Tile)
