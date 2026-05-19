import { computePinOffsets } from '../MuiTableAdapter/gridSxStyles';

describe('computePinOffsets', () => {
  it('left: cumulative from left', () => {
    expect(computePinOffsets([10, 20, 30], 'left')).toEqual([0, 10, 30]);
  });

  it('left: single element', () => {
    expect(computePinOffsets([50], 'left')).toEqual([0]);
  });

  it('left: empty', () => {
    expect(computePinOffsets([], 'left')).toEqual([]);
  });

  it('right: cumulative from right, rightmost gets 0', () => {
    expect(computePinOffsets([10, 20, 30], 'right')).toEqual([50, 30, 0]);
  });

  it('right: single element', () => {
    expect(computePinOffsets([50], 'right')).toEqual([0]);
  });

  it('right: empty', () => {
    expect(computePinOffsets([], 'right')).toEqual([]);
  });

  it('right: two elements', () => {
    expect(computePinOffsets([40, 60], 'right')).toEqual([60, 0]);
  });
});
