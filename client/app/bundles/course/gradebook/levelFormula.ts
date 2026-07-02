// A deliberately tiny arithmetic grammar mapping a student's Level to grade-points.
// PARSE, DON'T EVAL: the source is read into an AST of known node types and evaluated
// with plain arithmetic. No code path runs the string as code, so a hostile string can
// only ever produce a parse error.
//
// Grammar (standard precedence):
//   expr    := term (('+' | '-') term)*
//   term    := factor (('*' | '/') factor)*
//   factor  := '-' factor | primary
//   primary := number | var | func '(' args ')' | '(' expr ')'
//   var     := 'level'
//   func1   := 'floor' | 'ceil' | 'round'        (1 arg)
//   func2   := 'min' | 'max'                      (2 args)
//
// Examples (staff type these into the formula field):
//   min(level, 20) * 0.5    → 0.5 grade-points per level, capped at level 20 (max 10)
//   floor(level / 5)        → 1 grade-point per 5 levels
//   level                   → 1 grade-point per level, uncapped
// Anything outside this grammar (assignments, unknown identifiers, unknown
// functions, stray characters, …) is rejected at parse time — parseFormula
// returns { ok: false, error } rather than throwing or running the input.

import type { FormulaNode } from 'types/course/gradebook';

interface Scope {
  level: number;
}

const FUNCTIONS_1: Record<string, (x: number) => number> = {
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};
const FUNCTIONS_2: Record<string, (a: number, b: number) => number> = {
  min: Math.min,
  max: Math.max,
};
const VARIABLES = new Set(['level']);

const FUNCTION_NAMES = [
  ...Object.keys(FUNCTIONS_1),
  ...Object.keys(FUNCTIONS_2),
];
const VALID_NAMES = [...VARIABLES, ...FUNCTION_NAMES];

const editDistance = (a: string, b: string): number => {
  const rows = a.length;
  const cols = b.length;
  const dp: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0),
  );
  for (let i = 0; i <= rows; i += 1) dp[i][0] = i;
  for (let j = 0; j <= cols; j += 1) dp[0][j] = j;
  for (let i = 1; i <= rows; i += 1) {
    for (let j = 1; j <= cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[rows][cols];
};

const nearestName = (
  name: string,
  candidates: readonly string[],
): string | null => {
  const lower = name.toLowerCase();
  let best: string | null = null;
  let bestDistance = Infinity;
  candidates.forEach((candidate) => {
    const distance = editDistance(lower, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });
  return bestDistance <= 2 ? best : null;
};

const unrecognisedError = (
  name: string,
  candidates: readonly string[],
): string => {
  const suggestion = nearestName(name, candidates);
  return suggestion
    ? `"${name}" is not recognised - did you mean "${suggestion}"?`
    : `"${name}" is not recognised. You can use: ${candidates.join(', ')}.`;
};

export type ParsedFormula =
  | { ok: true; evaluate: (level: number) => number }
  | { ok: false; error: string };

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

const isDigit = (c: string): boolean => c >= '0' && c <= '9';
const isAlpha = (c: string): boolean =>
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

const tokenize = (src: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i += 1;
    } else if (isDigit(c) || c === '.') {
      let j = i + 1;
      while (j < src.length && (isDigit(src[j]) || src[j] === '.')) j += 1;
      const text = src.slice(i, j);
      const value = Number(text);
      if (!Number.isFinite(value))
        throw new Error(`"${text}" is not a valid number.`);
      tokens.push({ type: 'num', value });
      i = j;
    } else if (isAlpha(c)) {
      let j = i + 1;
      while (j < src.length && isAlpha(src[j])) j += 1;
      tokens.push({ type: 'ident', value: src.slice(i, j) });
      i = j;
    } else if (c === '+' || c === '-' || c === '−' || c === '*' || c === '/') {
      const op = c === '−' ? '-' : c;
      tokens.push({ type: 'op', value: op as '+' | '-' | '*' | '/' });
      i += 1;
    } else if (c === '(') {
      tokens.push({ type: 'lparen' });
      i += 1;
    } else if (c === ')') {
      tokens.push({ type: 'rparen' });
      i += 1;
    } else if (c === ',') {
      tokens.push({ type: 'comma' });
      i += 1;
    } else {
      throw new Error(`"${c}" cannot be used in a formula.`);
    }
  }
  return tokens;
};

// Recursive-descent parser building a serializable FormulaNode AST.
const buildAst = (tokens: Token[]): FormulaNode => {
  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];
  const eat = (): Token => {
    const t = tokens[pos];
    if (!t) throw new Error('The formula looks unfinished.');
    pos += 1;
    return t;
  };
  const expect = (type: 'comma' | 'rparen'): void => {
    const t = peek();
    if (!t || t.type !== type) {
      throw new Error(
        type === 'comma'
          ? 'This needs a comma - for example min(level, 25).'
          : 'This needs a closing bracket ")".',
      );
    }
    pos += 1;
  };

  let parseExpr: () => FormulaNode;

  const parsePrimary = (): FormulaNode => {
    const t = eat();
    if (t.type === 'num') return { type: 'num', value: t.value };
    if (t.type === 'lparen') {
      const inner = parseExpr();
      expect('rparen');
      return inner;
    }
    if (t.type === 'ident') {
      const name = t.value;
      if (peek()?.type === 'lparen') {
        eat(); // consume '('
        if (FUNCTIONS_1[name]) {
          const arg = parseExpr();
          expect('rparen');
          return { type: 'call1', fn: name as 'floor' | 'ceil' | 'round', arg };
        }
        if (FUNCTIONS_2[name]) {
          const a = parseExpr();
          expect('comma');
          const b = parseExpr();
          expect('rparen');
          return { type: 'call2', fn: name as 'min' | 'max', a, b };
        }
        throw new Error(unrecognisedError(name, FUNCTION_NAMES));
      }
      if (!VARIABLES.has(name))
        throw new Error(unrecognisedError(name, VALID_NAMES));
      return { type: 'var', name: 'level' };
    }
    throw new Error('The formula is not complete here.');
  };

  const parseFactor = (): FormulaNode => {
    const t = peek();
    if (t && t.type === 'op' && t.value === '-') {
      eat();
      const operand = parseFactor();
      return { type: 'neg', operand };
    }
    return parsePrimary();
  };

  const parseTerm = (): FormulaNode => {
    let left = parseFactor();
    let t = peek();
    while (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
      eat();
      const right = parseFactor();
      const op = t.value as '*' | '/';
      left = { type: 'binop', op, left, right };
      t = peek();
    }
    return left;
  };

  parseExpr = (): FormulaNode => {
    let left = parseTerm();
    let t = peek();
    while (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
      eat();
      const right = parseTerm();
      const op = t.value as '+' | '-';
      left = { type: 'binop', op, left, right };
      t = peek();
    }
    return left;
  };

  const ast = parseExpr();
  if (pos !== tokens.length)
    throw new Error(
      'Looks like an operator is missing - for example level × 2.',
    );
  return ast;
};

const evaluateBinop = (
  op: '+' | '-' | '*' | '/',
  left: number,
  right: number,
): number => {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? NaN : left / right;
    default:
      return 0;
  }
};

// Traverse a FormulaNode AST, substituting scope.level for 'var' nodes.
// Used by both parseFormula (FE evaluation) and serializeFormula callers.
export const evaluateNode = (node: FormulaNode, scope: Scope): number => {
  switch (node.type) {
    case 'num':
      return node.value;
    case 'var':
      return scope.level;
    case 'neg':
      return -evaluateNode(node.operand, scope);
    case 'binop': {
      const left = evaluateNode(node.left, scope);
      const right = evaluateNode(node.right, scope);
      return evaluateBinop(node.op, left, right);
    }
    case 'call1': {
      const arg = evaluateNode(node.arg, scope);
      return FUNCTIONS_1[node.fn](arg);
    }
    case 'call2': {
      const left = evaluateNode(node.a, scope);
      const right = evaluateNode(node.b, scope);
      return FUNCTIONS_2[node.fn](left, right);
    }
    default:
      return 0;
  }
};

const dependsOnLevel = (node: FormulaNode): boolean => {
  switch (node.type) {
    case 'var':
      return true;
    case 'num':
      return false;
    case 'neg':
      return dependsOnLevel(node.operand);
    case 'binop':
      return dependsOnLevel(node.left) || dependsOnLevel(node.right);
    case 'call1':
      return dependsOnLevel(node.arg);
    case 'call2':
      return dependsOnLevel(node.a) || dependsOnLevel(node.b);
    default:
      return false;
  }
};

const hasConstantZeroDivisor = (node: FormulaNode): boolean => {
  switch (node.type) {
    case 'num':
    case 'var':
      return false;
    case 'neg':
      return hasConstantZeroDivisor(node.operand);
    case 'binop':
      if (
        node.op === '/' &&
        !dependsOnLevel(node.right) &&
        evaluateNode(node.right, { level: 0 }) === 0
      )
        return true;
      return (
        hasConstantZeroDivisor(node.left) || hasConstantZeroDivisor(node.right)
      );
    case 'call1':
      return hasConstantZeroDivisor(node.arg);
    case 'call2':
      return hasConstantZeroDivisor(node.a) || hasConstantZeroDivisor(node.b);
    default:
      return false;
  }
};

// Parse src into a serializable FormulaNode AST. Returns ok:false on any parse error.
// Used by the save flow to produce the AST that is sent to and stored by the backend.
export const serializeFormula = (
  src: string,
): { ok: true; ast: FormulaNode } | { ok: false; error: string } => {
  try {
    const tokens = tokenize(src);
    if (tokens.length === 0) throw new Error('Enter a formula.');
    const ast = buildAst(tokens);
    if (hasConstantZeroDivisor(ast))
      throw new Error('This formula always divides by zero.');
    return { ok: true, ast };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'This formula is not valid.',
    };
  }
};

// Parse src and return an evaluate function. Public API is unchanged — callers
// get { ok: true, evaluate } or { ok: false, error }. Backed by evaluateNode.
export const parseFormula = (src: string): ParsedFormula => {
  const result = serializeFormula(src);
  if (!result.ok) return result;
  const { ast } = result;
  return {
    ok: true,
    evaluate: (level): number => {
      const val = evaluateNode(ast, { level });
      return Number.isFinite(val) ? val : NaN;
    },
  };
};

export const seedLevelFormula = 'level';
