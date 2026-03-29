import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useArchiveStore } from '../../store/archiveStore';
import { ArchiveGrid } from '../../components/archive/ArchiveGrid';
import { MurmurationCanvas } from '../../components/canvas/MurmurationCanvas';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function ArchiveScreen() {
  const entries = useArchiveStore((s) => s.entries);

  return (
    <View style={styles.container}>
      {/* Background murmuration at very low opacity */}
      <View style={styles.backgroundCanvas}>
        <MurmurationCanvas
          params={{
            particleCount: 80,
            speed: 0.15,
            colourTemperature: 0.1,
            cohesion: 0.5,
            turbulence: 0.02,
          }}
          width={width}
          height={height}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Archive</Text>
        <ArchiveGrid entries={entries} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  backgroundCanvas: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.parchment,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
});
