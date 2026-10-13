import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type KeyFeedback = 'light' | 'confirm';

export function playKeyFeedback(kind: KeyFeedback) {
  if (Platform.OS === 'web') {
    return;
  }

  void (async () => {
    try {
      if (Platform.OS === 'android') {
        await Haptics.performAndroidHapticsAsync(
          kind === 'confirm' ? Haptics.AndroidHaptics.Confirm : Haptics.AndroidHaptics.Keyboard_Tap,
        );
        return;
      }

      await Haptics.impactAsync(
        kind === 'confirm' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
    } catch {
      // Haptics are unavailable on some devices and simulators.
    }
  })();
}
