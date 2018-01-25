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
  end
end
