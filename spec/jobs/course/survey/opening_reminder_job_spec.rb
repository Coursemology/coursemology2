# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::OpeningReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:survey) { create(:survey) }

    context 'when start_at of the assessment is changed' do
      it 'creates a opening reminder job' do
        survey.start_at = Time.zone.now

        expect { survey.save }.to have_enqueued_job(Course::Survey::OpeningReminderJob)
      end
    end
  end
end
