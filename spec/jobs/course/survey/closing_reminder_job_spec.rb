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
  end
end
