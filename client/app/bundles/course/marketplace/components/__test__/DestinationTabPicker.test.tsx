import { fireEvent, render } from 'test-utils';

import DestinationTabPicker from '../DestinationTabPicker';

const tabs = [
  { id: 10, title: 'Tutorials', categoryId: 1, categoryTitle: 'Week 3' },
  { id: 11, title: 'Problem Sets', categoryId: 1, categoryTitle: 'Week 3' },
  { id: 20, title: 'Lab', categoryId: 2, categoryTitle: 'Week 4' },
];

it('renders an empty radio group when there are no tabs', async () => {
  const page = render(
    <DestinationTabPicker onChange={jest.fn()} tabs={[]} value={null} />,
  );

  expect(await page.findByRole('radiogroup')).toBeEmptyDOMElement();
});

it('groups tabs under one header per category and renders a radio per tab', async () => {
  const page = render(
    <DestinationTabPicker onChange={jest.fn()} tabs={tabs} value={11} />,
  );

  // I18nProvider (TypeBadge uses it) async-loads messages, so await the first query.
  expect(await page.findByText('Week 3')).toBeVisible();
  expect(page.getByText('Week 4')).toBeVisible();
  // The two Week 3 tabs share a single header.
  expect(page.getAllByText('Week 3')).toHaveLength(1);
  expect(page.getAllByRole('radio')).toHaveLength(3);
  // Headers are badged as categories, radios as tabs. RTL's text matcher only sees an element's
  // direct text-node children, so TypeBadge's Typography matches 'Category'/'Tab' on its own.
  expect(page.getAllByText('Category')).toHaveLength(2);
  expect(page.getAllByText('Tab')).toHaveLength(3);
});

// The fixture is interleaved AND in descending categoryId order, so first-seen order and any
// sorted order disagree — the flat `tabs` fixture above cannot tell them apart.
it('groups a category under its first-seen header when its tabs arrive non-contiguously', async () => {
  const interleavedTabs = [
    { id: 20, title: 'Lab', categoryId: 2, categoryTitle: 'Week 4' },
    { id: 10, title: 'Tutorials', categoryId: 1, categoryTitle: 'Week 3' },
    { id: 21, title: 'Recitation', categoryId: 2, categoryTitle: 'Week 4' },
  ];

  const page = render(
    <DestinationTabPicker
      onChange={jest.fn()}
      tabs={interleavedTabs}
      value={null}
    />,
  );

  // Week 4's two tabs are split by a Week 3 tab, but still share one header.
  expect(await page.findAllByText('Week 4')).toHaveLength(1);
  expect(page.getAllByText('Week 3')).toHaveLength(1);
  // Week 4 is seen first, so its group (and both its tabs) comes first.
  expect(
    page.getAllByRole('radio').map((radio) => radio.getAttribute('value')),
  ).toEqual(['20', '21', '10']);
});

it('marks the tab whose id equals value as checked', async () => {
  const page = render(
    <DestinationTabPicker onChange={jest.fn()} tabs={tabs} value={11} />,
  );

  expect(
    await page.findByRole('radio', { name: /Problem Sets/ }),
  ).toBeChecked();
  expect(page.getByRole('radio', { name: /Tutorials/ })).not.toBeChecked();
  expect(page.getByRole('radio', { name: /Lab/ })).not.toBeChecked();
});

it('checks no tab when value is null', async () => {
  const page = render(
    <DestinationTabPicker onChange={jest.fn()} tabs={tabs} value={null} />,
  );

  expect(await page.findAllByRole('radio')).toHaveLength(3);
  page
    .getAllByRole('radio')
    .forEach((radio) => expect(radio).not.toBeChecked());
});

it('fires onChange with the numeric tab id when another tab is chosen', async () => {
  const onChange = jest.fn();
  const page = render(
    <DestinationTabPicker onChange={onChange} tabs={tabs} value={11} />,
  );

  fireEvent.click(await page.findByRole('radio', { name: /Lab/ }));

  expect(onChange).toHaveBeenCalledWith(20);
});

it('does not move the selection itself when a tab is clicked', async () => {
  const page = render(
    <DestinationTabPicker onChange={jest.fn()} tabs={tabs} value={11} />,
  );

  fireEvent.click(await page.findByRole('radio', { name: /Lab/ }));

  // Controlled: the parent still says 11, so the checkmark must not move.
  expect(page.getByRole('radio', { name: /Problem Sets/ })).toBeChecked();
  expect(page.getByRole('radio', { name: /Lab/ })).not.toBeChecked();
});
