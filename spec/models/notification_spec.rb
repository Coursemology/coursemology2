require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe '#notify' do
    let!(:user) { create(:user, role: :administrator) }

    context 'when create a notification with a given activity record' do
      before do
        Notification.notify(user, user, user, activity: :created, types: [:activity_feed, :popup])
      end

      it 'is unread' do
        expect(Notification.unread_by(user).count).to_not eq(0)
      end

      it 'saves correct activity and notification information in database' do
        activity = Activity.find_by(recipient: user)
        expect(activity.notification.activity_feed).to eq(true)
        expect(activity.notification.popup).to eq(true)
        expect(activity.notification.email).to eq(false)
      end
    end

    context 'when create a notification without an activity record' do
      before do
        Notification.notify(user, user, user, types: [:popup])
      end

      it 'create a fake activity as the type of notify' do
        activity = Activity.find_by("key like '%notify'")
        expect(activity.notification.activity_feed).to eq(false)
        expect(activity.notification.popup).to eq(true)
        expect(activity.notification.email).to eq(false)
      end
    end
  end
end
