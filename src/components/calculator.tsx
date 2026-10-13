import { useMemo } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalculatorKey, type KeyVariant } from '@/components/calculator-key';
import { Fonts } from '@/constants/theme';
import { useCalculator } from '@/hooks/use-calculator';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { Operator } from '@/utils/calculator';
import { playKeyFeedback } from '@/utils/haptics';

const GAP = 12;
const SIDE = 16;
const MAX_WIDTH = 430;

type Palette = {
  background: string;
  display: string;
  expression: string;
  digit: string;
  digitText: string;
  fn: string;
  fnText: string;
  op: string;
  opText: string;
  ripple: string;
};

function useCalculatorPalette(): Palette {
  const scheme = useColorScheme();
  const theme = useTheme();
  const dark = scheme === 'dark';

  return {
    background: dark ? '#000000' : '#F2F2F7',
    display: theme.text,
    expression: theme.textSecondary,
    digit: dark ? '#333333' : '#FFFFFF',
    digitText: theme.text,
    fn: dark ? '#A5A5A5' : '#D1D1D6',
    fnText: dark ? '#000000' : '#1C1C1E',
    op: '#FF9F0A',
    opText: '#FFFFFF',
    ripple: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)',
  };
}

type KeyDef =
  | { kind: 'digit'; label: string; flex?: number }
  | { kind: 'decimal' }
  | { kind: 'clear' }
  | { kind: 'sign' }
  | { kind: 'percent' }
  | { kind: 'operator'; label: Operator }
  | { kind: 'equals' };

const ROWS: KeyDef[][] = [
  [{ kind: 'clear' }, { kind: 'sign' }, { kind: 'percent' }, { kind: 'operator', label: '÷' }],
  [
    { kind: 'digit', label: '7' },
    { kind: 'digit', label: '8' },
    { kind: 'digit', label: '9' },
    { kind: 'operator', label: '×' },
  ],
  [
    { kind: 'digit', label: '4' },
    { kind: 'digit', label: '5' },
    { kind: 'digit', label: '6' },
    { kind: 'operator', label: '-' },
  ],
  [
    { kind: 'digit', label: '1' },
    { kind: 'digit', label: '2' },
    { kind: 'digit', label: '3' },
    { kind: 'operator', label: '+' },
  ],
  [{ kind: 'digit', label: '0', flex: 2 }, { kind: 'decimal' }, { kind: 'equals' }],
];

export function Calculator() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const palette = useCalculatorPalette();
  const calculator = useCalculator();

  const layout = useMemo(() => {
    const boardWidth = Math.min(width, MAX_WIDTH) - SIDE * 2;
    const keyWidth = (boardWidth - GAP * 3) / 4;
    const rowsHeight = keyWidth * 5 + GAP * 4;
    const topSpace = insets.top + 88;
    const bottomSpace = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 8) + 12;
    const availableHeight = height - topSpace - bottomSpace;
    const size = rowsHeight > availableHeight ? (availableHeight - GAP * 4) / 5 : keyWidth;

    return { size: Math.max(56, Math.floor(size)) };
  }, [height, insets.bottom, insets.top, width]);

  const displaySize = calculator.display.length > 8 ? 48 : calculator.display.length > 6 ? 56 : 64;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 8,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 8) + 8,
        },
      ]}>
      <View style={styles.board}>
        <View style={styles.displayWrap}>
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={[styles.expression, { color: palette.expression }]}
            accessibilityLiveRegion="polite">
            {calculator.expression}
          </Text>
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            style={[styles.display, { color: palette.display, fontSize: displaySize }]}
            accessibilityRole="text"
            accessibilityLabel={`Result ${calculator.display}`}>
            {calculator.display}
          </Text>
        </View>

        <View style={styles.keys}>
          {ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((key) => {
                const visual = visualForKey(key, calculator.clearLabel, palette, calculator.activeOperator);
                return (
                  <CalculatorKey
                    key={`${rowIndex}-${key.kind}-${'label' in key ? key.label : ''}`}
                    label={visual.label}
                    accessibilityLabel={visual.accessibilityLabel}
                    variant={visual.variant}
                    flex={key.kind === 'digit' ? key.flex : 1}
                    size={layout.size}
                    backgroundColor={visual.backgroundColor}
                    textColor={visual.textColor}
                    highlighted={visual.highlighted}
                    rippleColor={palette.ripple}
                    onPress={() => pressKey(key, calculator)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function visualForKey(
  key: KeyDef,
  clear: 'AC' | 'C',
  palette: Palette,
  activeOperator: Operator | null,
): {
  label: string;
  accessibilityLabel: string;
  variant: KeyVariant;
  backgroundColor: string;
  textColor: string;
  highlighted?: boolean;
} {
  switch (key.kind) {
    case 'digit':
      return {
        label: key.label,
        accessibilityLabel: key.label,
        variant: 'digit',
        backgroundColor: palette.digit,
        textColor: palette.digitText,
      };
    case 'decimal':
      return {
        label: '.',
        accessibilityLabel: 'Decimal point',
        variant: 'digit',
        backgroundColor: palette.digit,
        textColor: palette.digitText,
      };
    case 'clear':
      return {
        label: clear,
        accessibilityLabel: clear === 'AC' ? 'All clear' : 'Clear',
        variant: 'fn',
        backgroundColor: palette.fn,
        textColor: palette.fnText,
      };
    case 'sign':
      return {
        label: '+/−',
        accessibilityLabel: 'Toggle sign',
        variant: 'fn',
        backgroundColor: palette.fn,
        textColor: palette.fnText,
      };
    case 'percent':
      return {
        label: '%',
        accessibilityLabel: 'Percent',
        variant: 'fn',
        backgroundColor: palette.fn,
        textColor: palette.fnText,
      };
    case 'operator':
      return {
        label: key.label,
        accessibilityLabel: operatorName(key.label),
        variant: 'op',
        backgroundColor: palette.op,
        textColor: palette.opText,
        highlighted: activeOperator === key.label,
      };
    case 'equals':
      return {
        label: '=',
        accessibilityLabel: 'Equals',
        variant: 'op',
        backgroundColor: palette.op,
        textColor: palette.opText,
      };
  }
}

function operatorName(operator: Operator): string {
  switch (operator) {
    case '+':
      return 'Add';
    case '-':
      return 'Subtract';
    case '×':
      return 'Multiply';
    case '÷':
      return 'Divide';
  }
}

function pressKey(key: KeyDef, calculator: ReturnType<typeof useCalculator>) {
  playKeyFeedback(key.kind === 'equals' ? 'confirm' : 'light');

  switch (key.kind) {
    case 'digit':
      calculator.onDigit(key.label);
      return;
    case 'decimal':
      calculator.onDecimal();
      return;
    case 'clear':
      calculator.onClear();
      return;
    case 'sign':
      calculator.onToggleSign();
      return;
    case 'percent':
      calculator.onPercent();
      return;
    case 'operator':
      calculator.onOperator(key.label);
      return;
    case 'equals':
      calculator.onEquals();
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  board: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    paddingHorizontal: SIDE,
    justifyContent: 'flex-end',
    gap: 20,
  },
  displayWrap: {
    minHeight: 108,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    gap: 4,
  },
  expression: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: '500',
    minHeight: 24,
    includeFontPadding: false,
  },
  display: {
    fontFamily: Fonts.rounded,
    fontWeight: '300',
    width: '100%',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  keys: {
    gap: GAP,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
});
