require 'rails_helper'

RSpec.describe Activity, type: :model do
  describe '#template_path' do
    let!(:user) { create(:user, role: :administrator) }
    let!(:activity) { create(:activity, key: 'test.notifications.tested') }

    context 'when translate key to path' do
      it 'returns a correct path' do
        expect(activity.template_path(:popup)).to eq('/test/notifications/tested/popup')
        expect(activity.template_path(:activity_feed)).
          to eq('/test/notifications/tested/activity_feed')
        expect(activity.template_path(:email)).to eq('/test/notifications/tested/email')
      end
    end

    context 'when translate key to unknown type path' do
      it 'returns nil' do
        expect(activity.template_path(:coursemology)).to eq(nil)
      end
    end
  end
end
