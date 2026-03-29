import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuid } from 'uuid';
import { IntentionInput } from '../../components/session/IntentionInput';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import { DEFAULT_THEME_ID } from '../../constants/themes';

export default function TodayScreen() {
  const router = useRouter();
  const startSession = useSessionStore((s) => s.startSession);

  const handleBegin = (intention: string, durationSeconds: number) => {
    const sessionId = uuid();
    startSession({
      sessionId,
      intention,
      durationSeconds,
      themeId: DEFAULT_THEME_ID,
    });
    router.push(`/session/${sessionId}`);
  };

  return (
    <View style={styles.container}>
      <IntentionInput onBegin={handleBegin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
});
