export type Operator = '+' | '-' | '×' | '÷';

export type CalculatorState = {
  display: string;
  previous: number | null;
  operator: Operator | null;
  fresh: boolean;
  expression: string;
};

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  display: '0',
  previous: null,
  operator: null,
  fresh: true,
  expression: '',
};

const MAX_DIGITS = 9;

export function parseDisplay(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ''));
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const abs = Math.abs(value);
  if (abs >= 1e9 || (abs !== 0 && abs < 1e-7)) {
    return value
      .toExponential(5)
      .replace('+', '')
      .replace(/\.?0+e/, 'e');
  }

  const rounded = Number(value.toPrecision(12));
  const [integer, fraction] = rounded.toString().split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

export function applyOperator(left: number, right: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? Number.NaN : left / right;
  }
}

function digitCount(display: string): number {
  return display.replace(/[^0-9]/g, '').length;
}

export function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.display === 'Error') {
    return { ...INITIAL_CALCULATOR_STATE, display: digit, fresh: false };
  }

  if (state.fresh) {
    return { ...state, display: digit, fresh: false };
  }

  if (state.display.replace('-', '') === '0') {
    return { ...state, display: state.display.startsWith('-') ? `-${digit}` : digit };
  }

  if (digitCount(state.display) >= MAX_DIGITS) {
    return state;
  }

  return { ...state, display: `${state.display}${digit}` };
}

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.fresh) {
    return { ...state, display: '0.', fresh: false };
  }

  if (state.display.includes('.')) {
    return state;
  }

  return { ...state, display: `${state.display}.` };
}

export function toggleSign(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') {
    return state;
  }

  if (state.display === '0') {
    return { ...state, display: '-0', fresh: false };
  }

  if (state.display.startsWith('-')) {
    return { ...state, display: state.display.slice(1) };
  }

  return { ...state, display: `-${state.display}` };
}

export function applyPercent(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') {
    return state;
  }

  const current = parseDisplay(state.display);
  const value =
    state.previous !== null && state.operator
      ? state.previous * (current / 100)
      : current / 100;

  return { ...state, display: formatNumber(value), fresh: true };
}

export function setOperator(state: CalculatorState, operator: Operator): CalculatorState {
  if (state.display === 'Error') {
    return { ...INITIAL_CALCULATOR_STATE, operator, expression: `0 ${operator}`, previous: 0 };
  }

  const current = parseDisplay(state.display);

  if (state.previous !== null && state.operator && !state.fresh) {
    const result = applyOperator(state.previous, current, state.operator);
    return {
      display: formatNumber(result),
      previous: result,
      operator,
      fresh: true,
      expression: Number.isFinite(result) ? `${formatNumber(result)} ${operator}` : '',
    };
  }

  return {
    ...state,
    previous: current,
    operator,
    fresh: true,
    expression: `${state.display} ${operator}`,
  };
}

export function evaluate(state: CalculatorState): CalculatorState {
  if (state.operator === null || state.previous === null) {
    return { ...state, expression: '', fresh: true };
  }

  const current = parseDisplay(state.display);
  const result = applyOperator(state.previous, current, state.operator);

  return {
    display: formatNumber(result),
    previous: null,
    operator: null,
    fresh: true,
    expression: `${formatNumber(state.previous)} ${state.operator} ${formatNumber(current)} =`,
  };
}

export function clearEntry(state: CalculatorState): CalculatorState {
  if (state.display === '0' || state.display === 'Error') {
    return INITIAL_CALCULATOR_STATE;
  }

  return { ...state, display: '0', fresh: true };
}

export function clearLabel(state: CalculatorState): 'AC' | 'C' {
  return state.display === '0' && state.operator === null ? 'AC' : 'C';
}
