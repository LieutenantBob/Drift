import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Drift</Text>
      <Text style={styles.subtitle}>Onboarding coming in Session 2.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 24,
    color: colors.parchment,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
});
