# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::StatisticsDownloadJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_teaching_assistant, course: course) }
    subject { Course::StatisticsDownloadJob }

    it 'can be queued' do
      expect { subject.perform_later(course, user, false, false) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'downloads the statistics' do
      download_job = subject.perform_later(course, user, false, false)
      download_job.perform_now
      expect(download_job.job).to be_completed
      expect(download_job.job.redirect_to).to be_present
    end
  end
end
