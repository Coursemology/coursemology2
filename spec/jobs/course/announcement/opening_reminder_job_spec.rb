# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Announcement::OpeningReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:announcement) { create(:course_announcement, start_at: old_start_at) }
    let(:time_now) { Time.zone.now }
    before { announcement.start_at = new_start_at }
    subject { announcement.save }

    context 'when old start_at is in the past' do
      let(:old_start_at) { time_now - 2.days }

      context 'when new start_at is in the future' do
        let(:new_start_at) { time_now + 3.days }
        it { expect { subject }.to have_enqueued_job(Course::Announcement::OpeningReminderJob) }
      end

      context 'when new start_at is in the past' do
        let(:new_start_at) { time_now - 3.days }
        it { expect { subject }.not_to have_enqueued_job(Course::Announcement::OpeningReminderJob) }
      end
    end

    context 'when old start_at is in the future' do
      let(:old_start_at) { time_now + 2.days }

      context 'when new start_at is in the future' do
        let(:new_start_at) { time_now + 3.days }
        it { expect { subject }.to have_enqueued_job(Course::Announcement::OpeningReminderJob) }
      end

      context 'when new start_at is in the past' do
        let(:new_start_at) { time_now - 2.days }
        it { expect { subject }.to have_enqueued_job(Course::Announcement::OpeningReminderJob) }
      end
    end

    # The examples above only assert the job is ENQUEUED. Running it (its `perform`) is what exercises
    # opening_reminder_job.rb + ReminderService; left to async specs that coverage is race-prone, so
    # run it deterministically here.
    context 'when the enqueued reminder job runs', :sidekiq_same_thread do
      let(:old_start_at) { time_now - 2.days }
      let(:new_start_at) { time_now + 3.days }

      it 'notifies the user of the announcement' do
        recipient = create(:course_user, course: announcement.course).user
        expect_any_instance_of(Course::AnnouncementNotifier).to receive(:new_announcement).once
        perform_sidekiq_jobs do
          described_class.perform_later(recipient, announcement, announcement.opening_reminder_token)
        end
      end
    end
  end
end
