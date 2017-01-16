# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::OpeningReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:video) { create(:video) }

    context 'when start_at is changed' do
      it 'creates a opening reminder job' do
        video.start_at = Time.zone.now

        expect { video.save }.to have_enqueued_job(Course::Video::OpeningReminderJob)
      end
    end
  end
end
