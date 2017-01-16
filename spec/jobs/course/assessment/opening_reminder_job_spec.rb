# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::OpeningReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }

    context 'when start_at of the assessment is changed' do
      it 'creates a opening reminder job' do
        assessment.start_at = Time.zone.now

        expect { assessment.save }.to have_enqueued_job(Course::Assessment::OpeningReminderJob)
      end
    end
  end
end
