import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';

export default function App() {
  const [showMainPage, setShowMainPage] = useState(false);
  const breathingAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start combined breathing animation (subtle scale + fade)
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        // Scale up and fade in (subtle growth)
        Animated.parallel([
          Animated.timing(breathingAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(logoFadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        // Keep size, fade out
        Animated.timing(logoFadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        // Reset scale for next cycle
        Animated.timing(breathingAnim, {
          toValue: 0.75,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    // Show main page after 1.5 seconds with fade transition
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowMainPage(true);
        fadeAnim.setValue(1);
      });
    }, 1500);

    return () => {
      breathingAnimation.stop();
      clearTimeout(timer);
    };
  }, []);

  if (showMainPage) {
    return (
      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        <Text style={styles.helloText}>hello!</Text>
        <StatusBar style="dark" />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
      <Animated.Image
        source={require('./assets/itufklogo.png')}
        style={[
          styles.logo,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: breathingAnim }],
          },
        ]}
      />
      <StatusBar style="auto" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
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
