# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ConsolidatedOpeningReminderMailerHelper, type: :helper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:activity) { create(:activity, event: :tested, notifier_type: 'UserNotifier') }
    let(:stub_notification) do
      notification = OpenStruct.new
      notification.activity = activity
      notification.notification_type = :test_type
      notification
    end

    describe '#actable_type_partial_path' do
      context 'when valid notification is provided' do
        subject { helper.actable_type_partial_path(stub_notification, 'Course::Assessment') }

        it 'returns the correct partial path' do
          is_expected.to eq('/notifiers/user_notifier/tested/open_structs/course/assessment')
        end
      end
    end
  end
end
