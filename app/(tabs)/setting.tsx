// index.tsx (used as a route screen in navigation or Expo Router)
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Button, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

const modelAsset = require('../../assets/model/nwssu.glb')

type CameraConfig = {
  orbitHomePosition: [number, number, number];
  targetPosition: [number, number, number];
  upVector: [number, number, number];
};

const COORDINATES: Record<string, CameraConfig> = {
  DEFAULT: {
    orbitHomePosition: [1.39, 0.30, 0.30],
    targetPosition: [0.43, 0.09, 0.09],
    upVector: [0, 1, 0],
  },
  CCIS: {
    orbitHomePosition: [-0.5426, -0.0179, -0.3014],
    targetPosition: [-0.8025, -0.0982, 0.6609],
    upVector: [ -0.2580, 21.8948, 1.7567],
  },
  COED: {
    orbitHomePosition: [-0.1543, -0.0221, -0.1367],
    targetPosition: [ -1.1491, 0.0198, -0.0447],
    upVector: [0.0412, 0.9885, -0.0046],
  },
  COM: {
    orbitHomePosition: [0.52, 0.23, 0.98],
    targetPosition: [0.42, 0.07, -0.01],
    upVector: [-0.02, 0.98, -0.15],
  }
}

function Scene() {
  const [cameraKey, setCameraKey] = useState('DEFAULT')
  const [customConfig, setCustomConfig] = useState<CameraConfig>(COORDINATES.DEFAULT)
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>(COORDINATES.DEFAULT)
  const [controlsVisible, setControlsVisible] = useState(true)
  
  const cameraManipulator = useCameraManipulator({
    ...cameraConfig,
    orbitSpeed: [0.003, 0.003],
  })

  const viewHeight = Dimensions.get('window').height

  useEffect(() => {
    setCameraConfig(COORDINATES[cameraKey])
  }, [cameraKey])

  const fetchCameraLookAt = () => {
    if (cameraManipulator?.getLookAt) {
      try {
        const [eye, target, up] = cameraManipulator.getLookAt()
        const coordText = `Eye: ${eye.map(n => n.toFixed(4)).join(', ')}\nTarget: ${target.map(n => n.toFixed(4)).join(', ')}\nUp: ${up.map(n => n.toFixed(4)).join(', ')}`;
        console.log(coordText)
      } catch (err) {
        console.error('Error getting camera look-at:', err)
      }
    }
  }

  const updateCameraWithCustomCoords = () => {
    setCameraConfig(customConfig)
  }

  const handleInputChange = (field: keyof CameraConfig, value: string) => {
    try {
      const numbers = value.split(',').map(Number)
      if (numbers.length !== 3 || numbers.some(isNaN)) {
        throw new Error('Invalid input')
      }
      
      setCustomConfig(prev => ({
        ...prev,
        [field]: numbers as [number, number, number]
      }))
    } catch (error) {
      console.error('Invalid input:', error)
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
      const yCorrected = viewHeight - focalY
      cameraManipulator?.scroll(focalX, yCorrected, -delta * scaleMultiplier)
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

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setControlsVisible(!controlsVisible)}
      >
        <Ionicons 
          name={controlsVisible ? "chevron-down" : "chevron-up"} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>

      {controlsVisible && (
        <View style={styles.controlsPanel}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Eye Position</Text>
            <TextInput
              style={styles.input}
              placeholder="x, y, z"
              value={customConfig.orbitHomePosition.join(', ')}
              onChangeText={(text) => handleInputChange('orbitHomePosition', text)}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Target Position</Text>
            <TextInput
              style={styles.input}
              placeholder="x, y, z"
              value={customConfig.targetPosition.join(', ')}
              onChangeText={(text) => handleInputChange('targetPosition', text)}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Up Vector</Text>
            <TextInput
              style={styles.input}
              placeholder="x, y, z"
              value={customConfig.upVector.join(', ')}
              onChangeText={(text) => handleInputChange('upVector', text)}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Apply" 
              onPress={updateCameraWithCustomCoords} 
              color="#6200ee"
            />
            <Button 
              title="Get Coords" 
              onPress={fetchCameraLookAt} 
              color="#03dac5"
            />
          </View>
          
          <View style={styles.locationButtons}>
            <Button title="Default" onPress={() => setCameraKey('DEFAULT')} />
            <Button title="CCIS" onPress={() => setCameraKey('CCIS')} />
            <Button title="COED" onPress={() => setCameraKey('COED')} />
            <Button title="COM" onPress={() => setCameraKey('COM')} />
          </View>
        </View>
      )}
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
  toggleButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },
  controlsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: 'white',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 45,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 10,
    color: 'black',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  locationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})