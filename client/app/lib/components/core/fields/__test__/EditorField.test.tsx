import { render } from 'test-utils';

import EditorField from '../EditorField';

const mockSetOption = jest.fn();

jest.mock('react-ace', () => {
  const { forwardRef } = require('react');

  return {
    __esModule: true,
    default: forwardRef((props: Record<string, unknown>, ref: unknown) => {
      const setOptions = props.setOptions as Record<string, unknown>;
      if (setOptions) mockSetOption(setOptions);

      return <div data-testid="ace-editor" />;
    }),
  };
});

beforeEach(() => {
  mockSetOption.mockClear();
});

describe('EditorField', () => {
  it('enables IDE typing features', () => {
    render(<EditorField language="python" />);

    expect(mockSetOption).toHaveBeenCalled();
    const options = mockSetOption.mock.calls[0][0];

    expect(options.behavioursEnabled).toBe(true);
    expect(options.wrapBehavioursEnabled).toBe(true);
    expect(options.enableMultiselect).toBe(true);
    expect(options.highlightActiveLine).toBe(true);
    expect(options.highlightSelectedWord).toBe(true);
    expect(options.showPrintMargin).toBe(false);
  });

  it('explicitly disables autocomplete for exam fairness', () => {
    render(<EditorField language="python" />);

    const options = mockSetOption.mock.calls[0][0];

    expect(options.enableBasicAutocompletion).toBe(false);
    expect(options.enableLiveAutocompletion).toBe(false);
    expect(options.enableSnippets).toBe(false);
  });
});
