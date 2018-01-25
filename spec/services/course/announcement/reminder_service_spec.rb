# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Announcement::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#opening_reminder' do
      let!(:now) { Time.zone.now }
      let(:user) { create(:course_user, course: course).user }
      let!(:announcement) { create(:course_announcement, start_at: now) }

      context 'when announcement is created' do
        it 'notify the users' do
          expect_any_instance_of(Course::AnnouncementNotifier).to receive(:new_announcement).once
          subject.opening_reminder(user, announcement, announcement.opening_reminder_token)
        end
      end
    end
  end
end
