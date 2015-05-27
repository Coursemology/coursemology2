require 'rails_helper'

RSpec.describe NotificationStyle, type: :model do
  it { is_expected.to belong_to(:activity).inverse_of(:notification_styles) }

  describe 'notification' do
    let!(:user) { create(:user, role: :administrator) }
    let!(:activity) { create(:activity, trackable: user, owner: user, key: 'test.created') }
    let!(:notification_style) do
      create(:notification_style, activity: activity, notification_type: :popup)
    end

    context 'when create a notification' do
      it 'is unread' do
        expect(NotificationStyle.unread_by(user).count).to_not eq(0)
      end

      it 'contains correct activity information' do
        notification = NotificationStyle.find_by(notification_type: :popup)
        expect(notification.activity).to eq(activity)
      end
    end

    context 'when get path from key' do
      it 'returns correct path though key' do
        notification = NotificationStyle.find_by(notification_type: :popup)
        expect(notification.template_path).to eq('/test/created/popup')
      end
    end
  end
end
