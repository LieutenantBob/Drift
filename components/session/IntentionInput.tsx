import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getDailyPrompt } from '../../constants/prompts';
import { DURATION_OPTIONS } from '../../constants/themes';
import { colors } from '../../constants/colors';

interface IntentionInputProps {
  onBegin: (intention: string, durationSeconds: number) => void;
}

export function IntentionInput({ onBegin }: IntentionInputProps) {
  const dailyPrompt = getDailyPrompt();
  const [isCustom, setIsCustom] = useState(false);
  const [customIntention, setCustomIntention] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1].seconds); // 15 min default

  const intention = isCustom ? customIntention : dailyPrompt;
  const canBegin = intention.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        {!isCustom ? (
          <>
            <Text style={styles.promptText}>{dailyPrompt}</Text>
            <View style={styles.promptActions}>
              <TouchableOpacity
                style={styles.useThisButton}
                onPress={() => canBegin && onBegin(dailyPrompt, selectedDuration)}
                disabled={!canBegin}
              >
                <Text style={styles.useThisText}>use this</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsCustom(true)}>
                <Text style={styles.writeOwnText}>write my own</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TextInput
            style={styles.customInput}
            value={customIntention}
            onChangeText={setCustomIntention}
            placeholder="What brings you here today?"
            placeholderTextColor={colors.muted}
            multiline
            autoFocus
            keyboardAppearance="dark"
          />
        )}
      </View>

      <View style={styles.durationRow}>
        {DURATION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.seconds}
            style={[
              styles.durationPill,
              selectedDuration === opt.seconds && styles.durationPillActive,
            ]}
            onPress={() => setSelectedDuration(opt.seconds)}
          >
            <Text
              style={[
                styles.durationText,
                selectedDuration === opt.seconds && styles.durationTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isCustom && (
        <TouchableOpacity
          style={[styles.beginButton, !canBegin && styles.beginButtonDisabled]}
          onPress={() => canBegin && onBegin(customIntention.trim(), selectedDuration)}
          disabled={!canBegin}
        >
          <Text style={styles.beginText}>Begin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  promptText: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 22,
    color: colors.parchment,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  promptActions: {
    alignItems: 'center',
    gap: 16,
  },
  useThisButton: {
    backgroundColor: colors.amber,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  useThisText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.night,
  },
  writeOwnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  customInput: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 22,
    color: colors.parchment,
    textAlign: 'center',
    lineHeight: 32,
    width: '100%',
    minHeight: 80,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  durationPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  durationPillActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  durationText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  durationTextActive: {
    color: colors.night,
  },
  beginButton: {
    backgroundColor: colors.amber,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 28,
  },
  beginButtonDisabled: {
    opacity: 0.4,
  },
  beginText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.night,
  },
});
