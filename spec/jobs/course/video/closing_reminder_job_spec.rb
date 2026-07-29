# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::ClosingReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:video) { create(:video) }

    context 'when end_at is changed' do
      it 'creates a closing reminder job' do
        video.end_at = 1.day.from_now

        expect { video.save }.to have_enqueued_job(Course::Video::ClosingReminderJob)
      end

      context 'when end_at is a past time' do
        it 'does not do create any jobs' do
          video.end_at = 1.day.ago

          expect { video.save }.not_to have_enqueued_job(Course::Video::ClosingReminderJob)
        end
      end
    end

    # The examples above only assert the job is ENQUEUED. Running it (its `perform`) is left to async
    # specs, where that coverage is race-prone; drive it deterministically here. The service has its
    # own spec, so we just assert the job runs it (without a tenant) after a real Redis round-trip.
    context 'when the enqueued reminder job runs', :sidekiq_same_thread do
      it 'invokes the closing reminder service' do
        expect(Course::Video::ReminderService).to receive(:closing_reminder).
          with(video, video.closing_reminder_token).once
        perform_sidekiq_jobs { described_class.perform_later(video, video.closing_reminder_token) }
      end
    end
  end
end
