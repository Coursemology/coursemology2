import { fireEvent, render, RenderResult, screen } from 'test-utils';

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

    it('shows the delete icon button', () => {
      expect(documentBody.getByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
    });

    it('does not show the confirmation dialog when clicked', () => {
      // Before clicking
      expect(documentBody.queryByTitle(PROMPT_TITLE)).toBeNull();

      fireEvent.click(screen.getByTestId('DeleteIconButton'));
      // After clicking
      expect(documentBody.queryByTitle(PROMPT_TITLE)).toBeNull();
    });

    it('matches the snapshot', () => {
      const { baseElement } = documentBody;
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

    it('shows the delete icon button', () => {
      expect(documentBody.getByTestId('DeleteIconButton')).toBeVisible();
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

    it('shows the delete icon button', () => {
      expect(documentBody.getByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
    });

    it('shows the confirmation dialog when clicked', () => {
      // Before clicking delete button
      expect(documentBody.queryByTitle(PROMPT_TITLE)).toBeNull();

      fireEvent.click(screen.getByTestId('DeleteIconButton'));
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
