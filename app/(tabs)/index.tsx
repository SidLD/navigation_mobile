// index.tsx (used as a route screen in navigation or Expo Router)
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>(COORDINATES.DEFAULT)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  
  const animatedConfig = {
    orbitHomePosition: [
      new Animated.Value(COORDINATES.DEFAULT.orbitHomePosition[0]),
      new Animated.Value(COORDINATES.DEFAULT.orbitHomePosition[1]),
      new Animated.Value(COORDINATES.DEFAULT.orbitHomePosition[2])
    ],
    targetPosition: [
      new Animated.Value(COORDINATES.DEFAULT.targetPosition[0]),
      new Animated.Value(COORDINATES.DEFAULT.targetPosition[1]),
      new Animated.Value(COORDINATES.DEFAULT.targetPosition[2])
    ],
    upVector: [
      new Animated.Value(COORDINATES.DEFAULT.upVector[0]),
      new Animated.Value(COORDINATES.DEFAULT.upVector[1]),
      new Animated.Value(COORDINATES.DEFAULT.upVector[2])
    ]
  }
  
  const cameraManipulator = useCameraManipulator({
    ...cameraConfig,
    orbitSpeed: [0.003, 0.003],
  })

  const viewHeight = Dimensions.get('window').height

  useEffect(() => {
    const newConfig = COORDINATES[cameraKey]
    
    // Animate to new position
    const animations = [
      ...animatedConfig.orbitHomePosition.map((anim, i) => 
        Animated.timing(anim, {
          toValue: newConfig.orbitHomePosition[i],
          duration: 800,
          useNativeDriver: false,
        })
      ),
      ...animatedConfig.targetPosition.map((anim, i) => 
        Animated.timing(anim, {
          toValue: newConfig.targetPosition[i],
          duration: 800,
          useNativeDriver: false,
        })
      ),
      ...animatedConfig.upVector.map((anim, i) => 
        Animated.timing(anim, {
          toValue: newConfig.upVector[i],
          duration: 800,
          useNativeDriver: false,
        })
      )
    ]
    
    Animated.parallel(animations).start()
    
    // Update camera config with animated values
    const updateConfig = () => {
      setCameraConfig({
        orbitHomePosition: [
          animatedConfig.orbitHomePosition[0]._value,
          animatedConfig.orbitHomePosition[1]._value,
          animatedConfig.orbitHomePosition[2]._value
        ],
        targetPosition: [
          animatedConfig.targetPosition[0]._value,
          animatedConfig.targetPosition[1]._value,
          animatedConfig.targetPosition[2]._value
        ],
        upVector: [
          animatedConfig.upVector[0]._value,
          animatedConfig.upVector[1]._value,
          animatedConfig.upVector[2]._value
        ]
      })
    }
    
    // Update config during animation
    const interval = setInterval(updateConfig, 16) // ~60fps
    
    setTimeout(() => {
      clearInterval(interval)
      setCameraConfig(newConfig) // Set final position
    }, 800)
    
    return () => clearInterval(interval)
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

  const coordinateOptions = Object.keys(COORDINATES)

  const handleCoordinateSelect = (key: string) => {
    setCameraKey(key)
    setDropdownVisible(false)
  }

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
            <Text style={styles.inputLabel}>Camera Position</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={styles.dropdownText}>{cameraKey}</Text>
              <Ionicons name="chevron-down" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={coordinateOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    item === cameraKey && styles.selectedDropdownItem
                  ]}
                  onPress={() => handleCoordinateSelect(item)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    item === cameraKey && styles.selectedDropdownItemText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  dropdown: {
    height: 45,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: 'black',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    minWidth: 200,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDropdownItem: {
    backgroundColor: '#6200ee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  selectedDropdownItemText: {
    color: 'white',
    fontWeight: 'bold',
  },
})