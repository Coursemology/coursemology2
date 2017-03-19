# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::ZipDownloadJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_programming_question) }
    let(:course) { assessment.course }
    let(:submission) { create(:submission, :submitted, assessment: assessment, course: course) }
    let(:course_user) { create(:course_teaching_assistant, course: course) }
    subject { Course::Assessment::Submission::ZipDownloadJob }

    it 'can be queued' do
      submission
      expect { subject.perform_later(course_user, assessment, nil) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'downloads the submissions' do
      submission
      download_job = subject.perform_later(course_user, assessment, nil)
      download_job.perform_now
      expect(download_job.job).to be_completed
      expect(download_job.job.redirect_to).to be_present
    end
  end
end
