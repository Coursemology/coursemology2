import { mount } from 'enzyme';
import storeCreator from 'course/user-notification/store';
import LevelReachedPopup from '../LevelReachedPopup';

const contextOptions = buildContextOptions(storeCreator({}));
function popupDialogWrapper(notification) {
  const wrapper = mount(
    <LevelReachedPopup notification={notification} />,
    contextOptions,
  );
  const dialogInline = wrapper.find('RenderToLayer').first().instance();
  return mount(dialogInline.props.render(), contextOptions);
}

describe('<LevelReachedPopup />', () => {
  describe('when leaderboard is disabled', () => {
    const wrapper = popupDialogWrapper({
      levelNumber: 5,
      leaderboardEnabled: false,
      leaderboardPosition: null,
    });

    it('does not show a link to the leaderboard', () => {
      expect(wrapper.find('FlatButton').length).toBe(1);
      expect(wrapper.find('p').length).toBe(0);
    });
  });

  describe('when the student is on the leaderboard', () => {
    const wrapper = popupDialogWrapper({
      levelNumber: 5,
      leaderboardEnabled: true,
      leaderboardPosition: 2,
    });

    it('shows leaderboard button and message', () => {
      expect(wrapper.find('FlatButton').length).toBe(2);
      expect(wrapper.find('p').length).toBe(1);
    });
  });

  describe('when the student is not on the leaderboard', () => {
    const wrapper = popupDialogWrapper({
      levelNumber: 5,
      leaderboardEnabled: true,
      leaderboardPosition: null,
    });

    it('shows leaderboard button but not message', () => {
      expect(wrapper.find('FlatButton').length).toBe(2);
      expect(wrapper.find('p').length).toBe(0);
    });
  });
});
