import React, { useRef, useEffect } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

interface WritingFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export function WritingField({ value, onChangeText, editable = true }: WritingFieldProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Autofocus on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={editable}
        placeholder=""
        placeholderTextColor="transparent"
        keyboardAppearance="dark"
        autoCorrect={false}
        scrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  input: {
    flex: 1,
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.82)',
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
});
