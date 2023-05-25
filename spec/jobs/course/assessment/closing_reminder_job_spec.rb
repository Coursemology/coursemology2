# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ClosingReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }

    context 'when end_at of the assessment is changed' do
      context 'when end_at is a time in the future' do
        it 'creates a closing reminder job' do
          old_closing_reminder_token = assessment.closing_reminder_token
          new_end_at = 1.day.from_now
          assessment.end_at = 1.day.from_now

          expect { assessment.save }.to have_enqueued_job(Course::Assessment::ClosingReminderJob).exactly(:once)
          expect(assessment.reload.end_at.to_i).to eq(new_end_at.to_i)
          expect(assessment.reload.closing_reminder_token).not_to eq(old_closing_reminder_token)
        end
      end

      context 'when end_at is a past time' do
        it 'does not create a closing reminder job, but updates the token' do
          old_closing_reminder_token = assessment.closing_reminder_token
          new_end_at = 1.day.ago
          assessment.end_at = new_end_at

          expect { assessment.save }.not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)
          expect(assessment.reload.end_at.to_i).to eq(new_end_at.to_i)
          expect(assessment.reload.closing_reminder_token).not_to eq(old_closing_reminder_token)
        end
      end

      context 'when end_at becomes nil' do
        let(:future_assessment) { create(:assessment, end_at: 1.day.from_now) }

        it 'does not create a closing reminder job, but updates the token' do
          old_closing_reminder_token = future_assessment.closing_reminder_token
          future_assessment.end_at = nil

          expect { future_assessment.save }.not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)
          expect(future_assessment.reload.end_at).to eq(nil)
          expect(future_assessment.reload.closing_reminder_token).not_to eq(old_closing_reminder_token)
        end
      end
    end
  end
end
