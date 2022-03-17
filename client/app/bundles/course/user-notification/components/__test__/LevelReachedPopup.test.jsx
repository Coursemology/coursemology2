import { mount } from 'enzyme';
import storeCreator from 'course/user-notification/store';
import LevelReachedPopup from '../LevelReachedPopup';

const contextOptions = buildContextOptions(storeCreator({}));
function popupDialogWrapper(notification) {
  const wrapper = mount(
    <LevelReachedPopup notification={notification} />,
    contextOptions,
  );
  const dialogInline = wrapper.find('ForwardRef(Dialog)');
  return dialogInline;
}

describe('<LevelReachedPopup />', () => {
  describe('when leaderboard is disabled', () => {
    const wrapper = popupDialogWrapper({
      levelNumber: 5,
      leaderboardEnabled: false,
      leaderboardPosition: null,
    });

    it('does not show a link to the leaderboard', () => {
      expect(wrapper.find('ForwardRef(Button)')).toHaveLength(1);
      expect(wrapper.find('p')).toHaveLength(0);
    });
  });

  describe('when the student is on the leaderboard', () => {
    const wrapper = popupDialogWrapper({
      levelNumber: 5,
      leaderboardEnabled: true,
      leaderboardPosition: 2,
    });

    it('shows leaderboard button and message', () => {
      expect(wrapper.find('ForwardRef(Button)')).toHaveLength(2);
      expect(wrapper.find('p')).toHaveLength(1);
    });
  });

  describe('when the student is not on the leaderboard', () => {
    const wrapper = popupDialogWrapper({
      levelNumber: 5,
      leaderboardEnabled: true,
      leaderboardPosition: null,
    });

    it('shows leaderboard button but not message', () => {
      expect(wrapper.find('ForwardRef(Button)')).toHaveLength(2);
      expect(wrapper.find('p')).toHaveLength(0);
    });
  });
});
