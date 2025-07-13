// index.tsx (used as a route screen in navigation or Expo Router)
import React from 'react'
import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  Model,
  useCameraManipulator,
} from 'react-native-filament'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Dimensions, StyleSheet } from 'react-native'
import { useSharedValue } from 'react-native-worklets-core'
import { SafeAreaView } from 'react-native-safe-area-context'

const modelAsset = require('../../assets/model/nwssu.glb') 

function Scene() {
  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: [0, 0, 8],
    targetPosition: [0, 0, 0],
    orbitSpeed: [0.003, 0.003],
  })

  const viewHeight = Dimensions.get('window').height

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      const yCorrected = viewHeight - event.y
      cameraManipulator?.grabBegin(event.x, yCorrected, false)
    })
    .onUpdate((event) => {
      const yCorrected = viewHeight - event.y
      cameraManipulator?.grabUpdate(event.x, yCorrected)
    })
    .onEnd(() => {
      cameraManipulator?.grabEnd()
    })
    .maxPointers(1)

  const previousScale = useSharedValue(1)
  const scaleMultiplier = 100

  const pinchGesture = Gesture.Pinch()
    .onBegin(({ scale }) => {
      previousScale.value = scale
    })
    .onUpdate(({ scale, focalX, focalY }) => {
      const delta = scale - previousScale.value
      cameraManipulator?.scroll(focalX, focalY, -delta * scaleMultiplier)
      previousScale.value = scale
    })

  const combinedGesture = Gesture.Race(pinchGesture, panGesture)

  return (
    <GestureDetector gesture={combinedGesture}>
      <FilamentView style={styles.container}>
        <Camera cameraManipulator={cameraManipulator} />
        <DefaultLight />
        <Model source={modelAsset} transformToUnitCube />
      </FilamentView>
    </GestureDetector>
  )
}

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FilamentScene>
        <Scene />
      </FilamentScene>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
