import { useCallback, useState } from 'react';

import {
  applyPercent,
  clearEntry,
  clearLabel,
  evaluate,
  INITIAL_CALCULATOR_STATE,
  inputDecimal,
  inputDigit,
  setOperator,
  toggleSign,
  type Operator,
} from '@/utils/calculator';

export function useCalculator() {
  const [state, setState] = useState(INITIAL_CALCULATOR_STATE);

  const onDigit = useCallback((digit: string) => {
    setState((current) => inputDigit(current, digit));
  }, []);

  const onDecimal = useCallback(() => {
    setState(inputDecimal);
  }, []);

  const onOperator = useCallback((operator: Operator) => {
    setState((current) => setOperator(current, operator));
  }, []);

  const onEquals = useCallback(() => {
    setState(evaluate);
  }, []);

  const onClear = useCallback(() => {
    setState(clearEntry);
  }, []);

  const onToggleSign = useCallback(() => {
    setState(toggleSign);
  }, []);

  const onPercent = useCallback(() => {
    setState(applyPercent);
  }, []);

  return {
    display: state.display,
    expression: state.expression,
    activeOperator: state.fresh ? state.operator : null,
    clearLabel: clearLabel(state),
    onDigit,
    onDecimal,
    onOperator,
    onEquals,
    onClear,
    onToggleSign,
    onPercent,
  };
}
