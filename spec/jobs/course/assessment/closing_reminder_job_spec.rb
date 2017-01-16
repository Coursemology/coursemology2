# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ClosingReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }

    context 'when end_at of the assessment is changed' do
      it 'creates a closing reminder job' do
        assessment.end_at = 1.day.from_now

        expect { assessment.save }.to have_enqueued_job(Course::Assessment::ClosingReminderJob)
      end

      context 'when end_at is a past time' do
        it 'does not do anything' do
          assessment.end_at = 1.day.ago

          expect { assessment.save }.
            not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)
        end
      end
    end
  end
end
