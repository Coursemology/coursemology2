import type { FormulaNode } from 'types/course/gradebook';

import {
  evaluateNode,
  parseFormula,
  seedLevelFormula,
  serializeFormula,
} from '../levelFormula';

const evalOk = (src: string, level: number): number => {
  const parsed = parseFormula(src);
  if (!parsed.ok) throw new Error(`expected ok, got: ${parsed.error}`);
  return parsed.evaluate(level);
};

describe('parseFormula', () => {
  it('evaluates arithmetic with correct precedence', () => {
    expect(evalOk('1 + 2 * 3', 0)).toBe(7);
    expect(evalOk('(1 + 2) * 3', 0)).toBe(9);
    expect(evalOk('10 / 2 - 1', 0)).toBe(4);
  });

  it('binds level as a raw variable (no clamp)', () => {
    expect(evalOk('level * 0.05', 15)).toBeCloseTo(0.75);
    expect(evalOk('level', 40)).toBe(40);
  });

  it('caps with min (the common cap idiom)', () => {
    expect(evalOk('min(level, 25) * 0.05', 25)).toBeCloseTo(1.25);
    expect(evalOk('min(level, 25) * 0.05', 40)).toBeCloseTo(1.25); // capped
    expect(evalOk('min(level, 25) * 0.05', 10)).toBeCloseTo(0.5);
  });

  it('supports min and max (two-arg)', () => {
    expect(evalOk('max(0, level - 5) * 0.1', 5)).toBe(0);
    expect(evalOk('max(0, level - 5) * 0.1', 30)).toBeCloseTo(2.5);
  });

  it('supports floor, ceil, round (one-arg)', () => {
    expect(evalOk('floor(level / 5)', 12)).toBe(2);
    expect(evalOk('ceil(level / 10)', 11)).toBe(2);
    expect(evalOk('round(level / 3)', 5)).toBe(2); // 1.66 -> 2
  });

  it('supports unary minus', () => {
    expect(evalOk('-level + 10', 3)).toBe(7);
  });

  it('rejects maxLevel — it is no longer a variable', () => {
    expect(parseFormula('maxLevel').ok).toBe(false);
    expect(parseFormula('level / maxLevel').ok).toBe(false);
  });

  it('rejects unknown identifiers (no eval surface)', () => {
    expect(parseFormula('system').ok).toBe(false);
    expect(parseFormula('window').ok).toBe(false);
    expect(parseFormula('level.constructor').ok).toBe(false);
  });

  it('rejects unknown functions and wrong arity', () => {
    expect(parseFormula('sqrt(level)').ok).toBe(false);
    expect(parseFormula('eval(level)').ok).toBe(false);
    expect(parseFormula('min(level)').ok).toBe(false); // min needs 2 args
    expect(parseFormula('floor(level, 2)').ok).toBe(false); // floor needs 1 arg
  });

  it('rejects malformed input with a message', () => {
    const r = parseFormula('level / ');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/unfinished/i);
  });
});

// Plain-language errors for non-technical staff. The thrown message is shown
// verbatim under the formula field, so it must read like prose, never compiler
// jargon (no "identifier", "token", "rparen").
const errorOf = (src: string): string => {
  const r = parseFormula(src);
  if (r.ok) throw new Error(`expected a parse error for "${src}"`);
  return r.error;
};

describe('parseFormula — plain-language errors', () => {
  it('never leaks compiler jargon', () => {
    const jargon = /identifier|token|rparen|lparen|trailing input/i;
    [
      'lveel',
      'min(level 20)',
      'level %2',
      'level / ',
      'min(level,)',
      'level 2',
      'flor(level)',
    ].forEach((src) => {
      expect(errorOf(src)).not.toMatch(jargon);
    });
  });

  it('suggests the nearest variable for a misspelt word', () => {
    expect(errorOf('lveel')).toContain('"lveel" is not recognised');
    expect(errorOf('lveel')).toContain('did you mean "level"');
    expect(errorOf('levl')).toContain('did you mean "level"');
  });

  it('suggests the nearest function for a misspelt call', () => {
    expect(errorOf('flor(level)')).toContain('did you mean "floor"');
    expect(errorOf('mn(level, 2)')).toContain('did you mean "min"');
  });

  it('lists the valid words when nothing is close', () => {
    const msg = errorOf('xyzzy');
    expect(msg).toContain('"xyzzy" is not recognised');
    expect(msg).not.toMatch(/did you mean/i);
    expect(msg).toMatch(/level, floor, ceil, round, min, max/);
  });

  it('lists only functions when an unknown call has no close match', () => {
    const msg = errorOf('frobnicate(level)');
    expect(msg).not.toMatch(/did you mean/i);
    expect(msg).toMatch(/floor, ceil, round, min, max/);
    expect(msg).not.toMatch(/level,/);
  });

  it('explains a missing comma with an example', () => {
    expect(errorOf('min(level 20)')).toMatch(/comma/i);
    expect(errorOf('min(level 20)')).toMatch(/min\(level, 25\)/);
  });

  it('explains a missing closing bracket', () => {
    expect(errorOf('min(level, 20')).toMatch(/closing bracket/i);
  });

  it('explains a stray symbol', () => {
    expect(errorOf('level % 2')).toContain('"%" cannot be used');
  });

  it('explains an unfinished formula', () => {
    expect(errorOf('level *')).toMatch(/unfinished/i);
  });

  it('flags two values with a missing operator', () => {
    expect(errorOf('level 2')).toMatch(/operator is missing/i);
    expect(errorOf('level 2')).toMatch(/level × 2/);
  });

  it('explains an invalid number', () => {
    expect(errorOf('1.2.3')).toContain('"1.2.3" is not a valid number');
  });
});

describe('seedLevelFormula', () => {
  it('seeds default formula to `level`', () => {
    expect(seedLevelFormula).toBe('level');
  });
});

describe('evaluateNode — direct traversal', () => {
  it('num: returns the literal value', () => {
    const node: FormulaNode = { type: 'num', value: 3.5 };
    expect(evaluateNode(node, { level: 0 })).toBe(3.5);
  });

  it('var: returns the level from scope', () => {
    const node: FormulaNode = { type: 'var', name: 'level' };
    expect(evaluateNode(node, { level: 15 })).toBe(15);
  });

  it('neg: negates operand', () => {
    const node: FormulaNode = {
      type: 'neg',
      operand: { type: 'num', value: 4 },
    };
    expect(evaluateNode(node, { level: 0 })).toBe(-4);
  });

  it('binop +: adds left and right', () => {
    const node: FormulaNode = {
      type: 'binop',
      op: '+',
      left: { type: 'num', value: 3 },
      right: { type: 'var', name: 'level' },
    };
    expect(evaluateNode(node, { level: 7 })).toBe(10);
  });

  it('binop /: returns NaN on div-by-zero', () => {
    const node: FormulaNode = {
      type: 'binop',
      op: '/',
      left: { type: 'var', name: 'level' },
      right: { type: 'num', value: 0 },
    };
    expect(evaluateNode(node, { level: 5 })).toBeNaN();
  });

  it('call1 floor: applies Math.floor', () => {
    const node: FormulaNode = {
      type: 'call1',
      fn: 'floor',
      arg: {
        type: 'binop',
        op: '/',
        left: { type: 'var', name: 'level' },
        right: { type: 'num', value: 5 },
      },
    };
    expect(evaluateNode(node, { level: 12 })).toBe(2); // floor(12/5) = floor(2.4) = 2
  });

  it('call2 min: returns smaller of two args', () => {
    const node: FormulaNode = {
      type: 'call2',
      fn: 'min',
      a: { type: 'var', name: 'level' },
      b: { type: 'num', value: 20 },
    };
    expect(evaluateNode(node, { level: 15 })).toBe(15);
    expect(evaluateNode(node, { level: 25 })).toBe(20);
  });

  it('call2 max: returns larger of two args', () => {
    const node: FormulaNode = {
      type: 'call2',
      fn: 'max',
      a: { type: 'num', value: 0 },
      b: {
        type: 'binop',
        op: '-',
        left: { type: 'var', name: 'level' },
        right: { type: 'num', value: 5 },
      },
    };
    expect(evaluateNode(node, { level: 3 })).toBe(0); // max(0, -2)
    expect(evaluateNode(node, { level: 8 })).toBe(3); // max(0, 3)
  });
});

describe('serializeFormula — round-trips', () => {
  it('serializes a number literal', () => {
    const result = serializeFormula('3.5');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ast).toEqual({ type: 'num', value: 3.5 });
  });

  it('serializes the level variable', () => {
    const result = serializeFormula('level');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ast).toEqual({ type: 'var', name: 'level' });
  });

  it('serializes unary minus', () => {
    const result = serializeFormula('-level');
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.ast).toEqual({
        type: 'neg',
        operand: { type: 'var', name: 'level' },
      });
  });

  it('serializes a binop tree for level * 0.5', () => {
    const result = serializeFormula('level * 0.5');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ast).toEqual({
        type: 'binop',
        op: '*',
        left: { type: 'var', name: 'level' },
        right: { type: 'num', value: 0.5 },
      });
    }
  });

  it('serializes min(level, 20)', () => {
    const result = serializeFormula('min(level, 20)');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ast).toEqual({
        type: 'call2',
        fn: 'min',
        a: { type: 'var', name: 'level' },
        b: { type: 'num', value: 20 },
      });
    }
  });

  it('serializes floor(level / 5)', () => {
    const result = serializeFormula('floor(level / 5)');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ast).toEqual({
        type: 'call1',
        fn: 'floor',
        arg: {
          type: 'binop',
          op: '/',
          left: { type: 'var', name: 'level' },
          right: { type: 'num', value: 5 },
        },
      });
    }
  });

  it('returns ok:false on invalid input', () => {
    const result = serializeFormula('level /');
    expect(result.ok).toBe(false);
  });

  it('round-trip: serialized AST evaluates identically to parseFormula', () => {
    const formula = 'min(level, 25) * 0.05';
    const parsed = parseFormula(formula);
    const serialized = serializeFormula(formula);
    expect(parsed.ok).toBe(true);
    expect(serialized.ok).toBe(true);
    if (parsed.ok && serialized.ok) {
      [10, 25, 40].forEach((level) => {
        expect(evaluateNode(serialized.ast, { level })).toBeCloseTo(
          parsed.evaluate(level),
        );
      });
    }
  });
});

describe('constant divide-by-zero (always divides by zero)', () => {
  it('rejects a literal divide by zero', () => {
    const r = parseFormula('level / 0');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/always divides by zero/i);
  });

  it('rejects a constant expression that evaluates to zero', () => {
    const r = parseFormula('100 / (5 - 5)');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/always divides by zero/i);
  });

  it('rejects a nested constant zero divisor', () => {
    const r = parseFormula('level / (1 / 0)');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/always divides by zero/i);
  });

  it('accepts a constant non-zero divisor', () => {
    expect(parseFormula('floor(level / 5)').ok).toBe(true);
  });

  it('accepts a level-dependent divisor', () => {
    expect(parseFormula('100 / level').ok).toBe(true);
    expect(parseFormula('100 / (level - 2)').ok).toBe(true);
  });

  it('returns NaN when the divisor evaluates to zero for a student', () => {
    expect(evalOk('level / (level - 5)', 5)).toBeNaN();
  });

  it('still divides normally when the divisor is non-zero', () => {
    expect(evalOk('level / (level - 5)', 7)).toBeCloseTo(3.5);
  });
});
