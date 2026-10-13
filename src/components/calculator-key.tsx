import { Platform, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Fonts } from '@/constants/theme';

export type KeyVariant = 'digit' | 'fn' | 'op';

type CalculatorKeyProps = {
  label: string;
  accessibilityLabel?: string;
  variant: KeyVariant;
  flex?: number;
  size: number;
  backgroundColor: string;
  textColor: string;
  rippleColor: string;
  highlighted?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CalculatorKey({
  label,
  accessibilityLabel,
  variant,
  flex = 1,
  size,
  backgroundColor,
  textColor,
  rippleColor,
  highlighted,
  onPress,
  style,
}: CalculatorKeyProps) {
  const radius = size / 2;
  const fontSize = variant === 'fn' || variant === 'op' ? size * 0.38 : size * 0.42;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      android_ripple={{
        color: rippleColor,
        foreground: true,
        borderless: false,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        variant === 'digit' && styles.digitElevation,
        {
          flex,
          height: size,
          borderRadius: radius,
          backgroundColor: highlighted ? textColor : backgroundColor,
          transform: [{ scale: pressed && Platform.OS !== 'android' ? 0.96 : 1 }],
          opacity: pressed && Platform.OS !== 'android' ? 0.88 : 1,
        },
        style,
      ]}>
      <Text
        allowFontScaling={false}
        style={[
          styles.label,
          {
            color: highlighted ? backgroundColor : textColor,
            fontSize,
            lineHeight: fontSize * 1.15,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  digitElevation: Platform.select({
    android: { elevation: 2 },
    default: {
      shadowColor: '#000000',
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 1 },
    },
  }),
  label: {
    fontFamily: Fonts.rounded,
    fontWeight: '500',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
