// index.tsx (used as a route screen in navigation or Expo Router)
import React, { useState } from 'react'
import { Button, Dimensions, StyleSheet, Text, View } from 'react-native'
import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  Model,
  useCameraManipulator,
} from 'react-native-filament'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSharedValue } from 'react-native-worklets-core'

const modelAsset = require('../../assets/model/coin.glb')

const COORDINATES: any = {
  DEFAULT: {
    orbitHomePosition: [1.39, 0.30, 0.30],
    targetPosition: [0.43, 0.09, 0.09],
  },
  CCIS: {
    orbitHomePosition: [-0.03, -0.01, 0.14],
    targetPosition: [-1.00, -0.21, 0.24],
    upVector: [-0.20, 0.96, 0.02],
  },
  COED: {
    orbitHomePosition: [-0.34, 0.007, 0.04],
    targetPosition: [-1.34, 0.04, -0.03],
    upVector: [-0.03, 1.00, -0.00],
  },
  COM:{
    orbitHomePosition: [0.52, 0.23, 0.98],
    targetPosition: [0.42, 0.07, -0.01],
    upVector: [-0.02, 0.98, -0.15],
  }
}

function Scene() {
  const [cameraInfo, setCameraInfo] = useState<{
    eye: number[]
    target: number[]
    up: number[]
  } | null>(null)
  const [cameraKey, setCameraKey] = useState('DEFAULT')

  const cameraManipulator = useCameraManipulator({
    ...COORDINATES[cameraKey],
    orbitSpeed: [0.003, 0.003],
  })

  const viewHeight = Dimensions.get('window').height

  const fetchCameraLookAt = () => {
    if (cameraManipulator?.getLookAt) {
      try {
        const [eye, target, up] = cameraManipulator.getLookAt()
        setCameraInfo({ eye, target, up })
        console.log('Camera LookAt:', { eye, target, up })
      } catch (err) {
        console.error('Error getting camera look-at:', err)
      }
    }
  }

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
    <>
      <GestureDetector gesture={combinedGesture}>
        <FilamentView style={styles.container}>
          <Camera cameraManipulator={cameraManipulator} />
          <DefaultLight />
          <Model source={modelAsset} transformToUnitCube />
        </FilamentView>
      </GestureDetector>

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <Text style={styles.label}>
          Eye: {cameraInfo?.eye?.map((n) => n.toFixed(2)).join(', ')}
        </Text>
        <Text style={styles.label}>
          Target: {cameraInfo?.target?.map((n) => n.toFixed(2)).join(', ')}
        </Text>
        <Text style={styles.label}>
          Up: {cameraInfo?.up?.map((n) => n.toFixed(2)).join(', ')}
        </Text>

        <View style={styles.buttonRow}>
          <Button title="Default" onPress={() => setCameraKey('DEFAULT')} />
          <Button title="CCIS" onPress={() => setCameraKey('CCIS')} />
          <Button title="COED" onPress={() => setCameraKey('COED')} />
          <Button title="COM" onPress={() => setCameraKey('COM')} />
        </View>

        <Button onPress={fetchCameraLookAt} title="Show" />
      </View>
    </>
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
  overlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 10,
  },
  label: {
    color: '#000',
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 10,
  },
})
