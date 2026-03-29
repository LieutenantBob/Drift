import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCanvasRef, ImageFormat } from '@shopify/react-native-skia';
import { MurmurationCanvas } from '../../components/canvas/MurmurationCanvas';
import { useCanvasEngine } from '../../components/canvas/useCanvasEngine';
import { WritingField } from '../../components/session/WritingField';
import { TimerRing } from '../../components/session/TimerRing';
import { playBell, resetBell } from '../../components/session/BellPlayer';
import { saveThumbnail } from '../../lib/thumbnail';
import { useSessionStore } from '../../store/sessionStore';
import { useArchiveStore } from '../../store/archiveStore';
import { colors } from '../../constants/colors';
import type { JournalEntry } from '../../types';

const { width, height } = Dimensions.get('window');

export default function SessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const canvasRef = useCanvasRef();

  const session = useSessionStore();
  const addEntry = useArchiveStore((s) => s.addEntry);
  const { params, onTextChange } = useCanvasEngine();

  const [frozen, setFrozen] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const intentionOpacity = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasEndedRef = useRef(false);

  // Fade intention text after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(intentionOpacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 10000);
    return () => clearTimeout(timeout);
  }, [intentionOpacity]);

  // Timer
  useEffect(() => {
    resetBell();
    timerRef.current = setInterval(() => {
      session.updateElapsed(session.elapsedSeconds + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Use a separate effect to watch elapsed time
  useEffect(() => {
    if (
      session.elapsedSeconds >= session.durationSeconds &&
      !hasEndedRef.current
    ) {
      endSession();
    }
  }, [session.elapsedSeconds, session.durationSeconds]);

  const endSession = useCallback(async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    // Freeze canvas
    setFrozen(true);
    session.endSession();

    // Play bell
    await playBell();

    // Show done state
    setShowDone(true);

    // Capture thumbnail
    let thumbnailUri = '';
    try {
      const snapshot = canvasRef.current?.makeImageSnapshot();
      if (snapshot) {
        const base64 = snapshot.encodeToBase64(ImageFormat.JPEG, 85);
        thumbnailUri = await saveThumbnail(base64, id ?? 'unknown');
      }
    } catch (err) {
      console.warn('Thumbnail capture failed:', err);
    }

    // Save entry
    const entry: JournalEntry = {
      id: id ?? 'unknown',
      createdAt: new Date().toISOString(),
      intention: session.intention,
      body: session.body,
      durationSeconds: session.durationSeconds,
      themeId: session.themeId,
      finalParams: params,
      thumbnailUri,
    };
    addEntry(entry);

    // Wait 2 seconds then navigate to archive
    setTimeout(() => {
      setShowDone(false);
      session.resetSession();
      router.replace('/(tabs)/archive');
    }, 2000);
  }, [id, session, params, addEntry, router, canvasRef]);

  const handleTextChange = useCallback(
    (text: string) => {
      session.updateBody(text);
      onTextChange(text);
    },
    [session, onTextChange],
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Full-screen canvas */}
      <MurmurationCanvas
        params={params}
        width={width}
        height={height}
        frozen={frozen}
        canvasRef={canvasRef}
      />

      {/* Intention text — fades after 10s */}
      <Animated.View style={[styles.intentionContainer, { opacity: intentionOpacity }]}>
        <Text style={styles.intentionText}>{session.intention}</Text>
      </Animated.View>

      {/* Writing field */}
      {!showDone && (
        <WritingField
          value={session.body}
          onChangeText={handleTextChange}
          editable={!frozen}
        />
      )}

      {/* Timer ring */}
      <TimerRing
        elapsedSeconds={session.elapsedSeconds}
        totalSeconds={session.durationSeconds}
      />

      {/* Done state overlay */}
      {showDone && (
        <View style={styles.doneOverlay}>
          <View style={styles.doneCircle} />
          <Text style={styles.doneText}>Hold the thought.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  intentionContainer: {
    position: 'absolute',
    top: 80,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  intentionText: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 15,
    color: 'rgba(200,185,160,0.6)',
    textAlign: 'center',
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,9,15,0.4)',
  },
  doneCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 24,
  },
  doneText: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 20,
    color: colors.parchment,
  },
});
