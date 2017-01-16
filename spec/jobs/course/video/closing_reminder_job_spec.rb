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
  end
end
