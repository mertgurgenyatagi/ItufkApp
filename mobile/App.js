import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';

export default function App() {
  const [showMainPage, setShowMainPage] = useState(false);
  const breathingAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start breathing animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    // Show main page after 0.8 seconds
    const timer = setTimeout(() => {
      setShowMainPage(true);
    }, 800);

    return () => {
      breathingAnimation.stop();
      clearTimeout(timer);
    };
  }, []);

  if (showMainPage) {
    return (
      <View style={styles.mainContainer}>
        <Text style={styles.helloText}>hello!</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Animated.Image
        source={require('./assets/itufklogo.png')}
        style={[
          styles.logo,
          {
            transform: [{ scale: breathingAnim }],
          },
        ]}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  helloText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
});
