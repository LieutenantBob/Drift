import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import type { JournalEntry } from '../../types';
import { colors } from '../../constants/colors';

interface EntryCardProps {
  entry: JournalEntry;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48 - 12) / 2; // 24px padding each side, 12px gap
const CARD_HEIGHT = CARD_WIDTH * 1.3;

export function EntryCard({ entry }: EntryCardProps) {
  const date = new Date(entry.createdAt);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.thumbnailContainer}>
        {entry.thumbnailUri ? (
          <Image
            source={{ uri: entry.thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]} />
        )}
      </View>
      <Text style={styles.date}>{dateStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.ink,
  },
  date: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: colors.muted,
    marginTop: 6,
  },
});
