# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationNotificationsHelper, type: :helper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:activity) { create(:activity, event: :tested, notifier_type: 'UserNotifier') }
    # The helper derives the view directory from the notification's class name, so the stub
    # needs to be a named class rather than an anonymous struct or a double.
    before { stub_const('StubNotification', Struct.new(:activity, :notification_type)) }
    let(:stub_notification) { StubNotification.new(activity, :test_type) }

    describe '#notification_view_path' do
      context 'when valid notification is provided' do
        subject { helper.notification_view_path(stub_notification) }

        it 'returns the correct view path' do
          is_expected.to eq('notifiers/user_notifier/tested/stub_notifications/test_type')
        end
      end
    end
  end
end
