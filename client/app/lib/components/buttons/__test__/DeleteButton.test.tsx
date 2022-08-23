import { fireEvent, render, screen, RenderResult } from 'utilities/test-utils';
import DeleteButton from '../DeleteButton';

let documentBody: RenderResult;

describe('<DeleteButton />', () => {
  describe('when the delete button is rendered without confirmation dialog', () => {
    beforeEach(() => {
      documentBody = render(
        <DeleteButton disabled={false} onClick={jest.fn()} loading={false} />,
      );
    });

    it('shows the delete icon button', () => {
      expect(documentBody.getByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
    });

    it('does not show the confirmation dialog when clicked', () => {
      // Before clicking
      expect(documentBody.queryByTestId('ConfirmationDialog')).toBeNull();

      fireEvent.click(screen.getByTestId('DeleteIconButton'));
      // After clicking
      expect(documentBody.queryByTestId('ConfirmationDialog')).toBeNull();
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
          disabled
          onClick={jest.fn()}
          loading={false}
          confirmMessage="Are you sure you wish to delete?"
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
          disabled={false}
          onClick={jest.fn()}
          loading={false}
          confirmMessage="Are you sure you wish to delete?"
        />,
      );
    });

    it('shows the delete icon button', () => {
      expect(documentBody.getByTestId('DeleteIconButton')).toBeVisible();
      expect(documentBody.getByTestId('DeleteIcon')).toBeVisible();
    });

    it('shows the confirmation dialog when clicked', () => {
      // Before clicking delete button
      expect(documentBody.queryByTestId('ConfirmationDialog')).toBeNull();

      fireEvent.click(screen.getByTestId('DeleteIconButton'));
      // After clicking delete button
      expect(documentBody.getByTestId('ConfirmationDialog')).toBeVisible();

      expect(documentBody.getByText('Continue')).toBeEnabled();
      expect(documentBody.getByText('Cancel')).toBeEnabled();

      // After clicking cancel in the confirmation dialog, it is closed
      fireEvent.click(screen.getByText('Cancel'));
      expect(documentBody.queryByTestId('ConfirmationDialog')).toBeNull();
    });
  });
});
