import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { EntryCard } from './EntryCard';
import type { JournalEntry } from '../../types';
import { colors } from '../../constants/colors';

interface ArchiveGridProps {
  entries: JournalEntry[];
}

export function ArchiveGrid({ entries }: ArchiveGridProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your archive is empty.</Text>
        <Text style={styles.emptySubtext}>Begin a session to create your first entry.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => <EntryCard entry={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 20,
    color: colors.parchment,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});
