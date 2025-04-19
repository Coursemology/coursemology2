import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from 'test-utils';

import DeleteButton from '../DeleteButton';

let documentBody: RenderResult;

const PROMPT_TITLE = 'Are you sure you are deleting?' as const;

describe('<DeleteButton />', () => {
  describe('when the delete button is rendered without confirmation dialog', () => {
    beforeEach(() => {
      documentBody = render(
        <DeleteButton disabled={false} loading={false} onClick={jest.fn()} />,
      );
    });

    it('shows the delete icon button', async () => {
      expect(await documentBody.findByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
    });

    it('does not show the confirmation dialog when clicked', async () => {
      // Before clicking
      await waitFor(() =>
        expect(documentBody.queryByTitle(PROMPT_TITLE)).not.toBeInTheDocument(),
      );

      fireEvent.click(await screen.findByTestId('DeleteIconButton'));

      // After clicking
      await waitFor(() =>
        expect(documentBody.queryByTitle(PROMPT_TITLE)).toBeNull(),
      );
    });

    it('matches the snapshot', async () => {
      const { baseElement } = documentBody;
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('when the delete button is disabled', () => {
    beforeEach(() => {
      documentBody = render(
        <DeleteButton
          confirmMessage={PROMPT_TITLE}
          disabled
          loading={false}
          onClick={jest.fn()}
        />,
      );
    });

    it('shows the delete icon button', async () => {
      expect(await documentBody.findByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIconButton')).toBeDisabled();
    });
  });

  describe('when the delete button is rendered with confirmation dialog', () => {
    beforeEach(() => {
      documentBody = render(
        <DeleteButton
          confirmMessage={PROMPT_TITLE}
          disabled={false}
          loading={false}
          onClick={jest.fn()}
        />,
      );
    });

    it('shows the delete icon button', async () => {
      expect(await documentBody.findByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
    });

    it('shows the confirmation dialog when clicked', async () => {
      // Before clicking delete button
      await waitFor(() =>
        expect(documentBody.queryByTitle(PROMPT_TITLE)).not.toBeInTheDocument(),
      );

      fireEvent.click(await screen.findByTestId('DeleteIconButton'));
      // After clicking delete button
      expect(documentBody.getByText(PROMPT_TITLE)).toBeVisible();

      expect(documentBody.getByText('Delete')).toBeEnabled();
      expect(documentBody.getByText('Cancel')).toBeEnabled();

      // After clicking cancel in the confirmation dialog, it is closed
      fireEvent.click(screen.getByText('Cancel'));
      expect(documentBody.queryByTitle(PROMPT_TITLE)).toBeNull();
    });
  });
});
