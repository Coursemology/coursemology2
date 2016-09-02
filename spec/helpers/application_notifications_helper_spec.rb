# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationNotificationsHelper, type: :helper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#notification_view_path' do
      let(:activity) { create(:activity, event: :tested, notifier_type: 'UserNotifier') }
      let(:stub_notification) do
        notification = OpenStruct.new
        notification.activity = activity
        notification.notification_type = :test_type
        notification
      end

      context 'when valid notification is provided' do
        subject { helper.notification_view_path(stub_notification) }

        it 'returns the correct view path' do
          is_expected.to eq('/notifiers/user_notifier/tested/open_structs/test_type')
        end
      end
    end
  end
end
