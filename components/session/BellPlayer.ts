import { Audio } from 'expo-av';

// We'll use placeholder silent audio for Session 1 dev
// Replace with real singing bowl samples before shipping
let hasPlayed = false;

export function resetBell(): void {
  hasPlayed = false;
}

export async function playBell(): Promise<void> {
  if (hasPlayed) return;
  hasPlayed = true;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });

    const bell1 = require('../../assets/sounds/bell1.wav');
    const bell2 = require('../../assets/sounds/bell2.wav');
    const bell3 = require('../../assets/sounds/bell3.wav');

    const [b1, b2, b3] = await Promise.all([
      Audio.Sound.createAsync(bell1),
      Audio.Sound.createAsync(bell2),
      Audio.Sound.createAsync(bell3),
    ]);

    await b1.sound.playAsync();
    await new Promise((r) => setTimeout(r, 800));
    await b2.sound.playAsync();
    await new Promise((r) => setTimeout(r, 800));
    await b3.sound.playAsync();

    // Cleanup after playback
    setTimeout(async () => {
      await b1.sound.unloadAsync();
      await b2.sound.unloadAsync();
      await b3.sound.unloadAsync();
    }, 5000);
  } catch (error) {
    console.warn('Bell playback failed:', error);
  }
}
