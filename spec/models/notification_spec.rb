require 'rails_helper'

RSpec.describe Notification, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:course) }

    describe 'create a notification' do
      let!(:user) { create(:user) }
      let!(:course) { create(:course) }
      let!(:notification) { create(:notification, user: user, course: course) }

      it 'is unread' do
        expect(user.notifications.unread_by(user).count).to eq(1)
      end
    end

    describe 'create a specific notification' do
      context 'when center_popup is created' do
        let!(:center_popup) { create(:center_popup) }

        it 'is CenterPopup type' do
          expect(center_popup.type).to eq('Notification::CenterPopup')
        end
      end

      context 'when right_side_popup is created' do
        let!(:right_side_popup) { create(:right_side_popup) }

        it 'is RightSidePopup type' do
          expect(right_side_popup.type).to eq('Notification::RightSidePopup')
        end
      end
    end

    describe 'send notification' do
      let!(:user) { create(:user) }
      let!(:course) { create(:course) }
      let(:email) { Notification.notify(user, course, type: :email) }

      it 'create a correct type of notification' do
        Notification.notify(user, course, type: :center_popup)
        Notification.notify(user, course, type: :right_side_popup)

        expect(user.center_popup.count).to eq(1)
        expect(user.right_side_popup.count).to eq(1)
        expect { email }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end
    end
  end
end
