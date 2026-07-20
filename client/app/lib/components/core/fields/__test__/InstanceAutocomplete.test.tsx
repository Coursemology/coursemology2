import { useState } from 'react';
import { fireEvent, render } from 'test-utils';

import InstanceAutocomplete, { InstanceOption } from '../InstanceAutocomplete';

const OPTIONS: InstanceOption[] = [
  { id: 1, name: 'Default' },
  { id: 2, name: 'Alpha' },
];

const Harness = ({
  onChange,
}: {
  onChange: (id: number | null) => void;
}): JSX.Element => {
  const [value, setValue] = useState<number | null>(null);
  return (
    <InstanceAutocomplete
      label="Instance"
      onChange={(id): void => {
        setValue(id);
        onChange(id);
      }}
      options={OPTIONS}
      value={value}
    />
  );
};

it("shows the selected option's name and reports the chosen id", async () => {
  const onChange = jest.fn();
  const page = render(<Harness onChange={onChange} />);

  const combobox = await page.findByRole('combobox', { name: 'Instance' });
  fireEvent.mouseDown(combobox);
  fireEvent.click(page.getByRole('option', { name: 'Alpha' }));

  expect(onChange).toHaveBeenCalledWith(2);
  expect(combobox).toHaveValue('Alpha');
});

it('reports null when the selection is cleared', async () => {
  const onChange = jest.fn();
  const page = render(<Harness onChange={onChange} />);

  const combobox = await page.findByRole('combobox', { name: 'Instance' });
  fireEvent.mouseDown(combobox);
  fireEvent.click(page.getByRole('option', { name: 'Default' }));
  expect(onChange).toHaveBeenLastCalledWith(1);

  fireEvent.click(page.getByTitle('Clear'));
  expect(onChange).toHaveBeenLastCalledWith(null);
});
