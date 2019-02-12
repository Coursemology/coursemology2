# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::SurveyDownloadJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:survey) do
      create(:survey, course: course, published: true, end_at: Time.zone.now + 1.day,
                      creator: course.creator, updater: course.creator)
    end
    subject { Course::Survey::SurveyDownloadJob }

    it 'can be queued' do
      expect { subject.perform_later(survey) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'downloads the survey' do
      download_job = subject.perform_later(survey)
      download_job.perform_now
      expect(download_job.job).to be_completed
      expect(download_job.job.redirect_to).to be_present
    end
  end
end
