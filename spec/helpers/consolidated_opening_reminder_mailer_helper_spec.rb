# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ConsolidatedOpeningReminderMailerHelper, type: :helper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:activity) { create(:activity, event: :tested, notifier_type: 'UserNotifier') }
    # The helper derives the partial directory from the notification's class name, so the stub
    # needs to be a named class rather than an anonymous struct or a double.
    before { stub_const('StubNotification', Struct.new(:activity, :notification_type)) }
    let(:stub_notification) { StubNotification.new(activity, :test_type) }

    describe '#actable_type_partial_path' do
      context 'when valid notification is provided' do
        subject { helper.actable_type_partial_path(stub_notification, 'Course::Assessment') }

        it 'returns the correct partial path' do
          is_expected.to eq('notifiers/user_notifier/tested/stub_notifications/course/assessment')
        end
      end
    end
  end
end
