# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::ClosingReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:survey) { create(:survey) }

    context 'when end_at of the survey is changed' do
      it 'creates a closing reminder job' do
        survey.end_at = 1.day.from_now

        expect { survey.save }.to have_enqueued_job(Course::Survey::ClosingReminderJob)
      end

      context 'when end_at is a past time' do
        it 'does not do anything' do
          survey.end_at = 1.day.ago

          expect { survey.save }.
            not_to have_enqueued_job(Course::Survey::ClosingReminderJob)
        end
      end
    end

    # The examples above only assert the job is ENQUEUED. Running it (its `perform`) is left to async
    # specs, where that coverage is race-prone; drive it deterministically here. The service has its
    # own spec, so we just assert the job runs it after a real Redis round-trip.
    context 'when the enqueued reminder job runs', :sidekiq_same_thread do
      it 'invokes the closing reminder service' do
        expect(Course::Survey::ReminderService).to receive(:closing_reminder).
          with(survey, survey.closing_reminder_token).once
        perform_sidekiq_jobs { described_class.perform_later(survey, survey.closing_reminder_token) }
      end
    end
  end
end
