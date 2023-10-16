# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsDownloadJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:student1) { create(:course_user, course: course, name: 'Student 1') }
    let!(:manual_record1) { create(:course_experience_points_record, course_user: student1) }
    subject { Course::ExperiencePointsDownloadJob }

    it 'can be queued' do
      expect { subject.perform_later(course, student1.id) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'downloads the experience points csv' do
      download_job = subject.perform_later(course, student1.id)
      download_job.perform_now
      expect(download_job.job).to be_completed
      expect(download_job.job.redirect_to).to be_present
    end
  end
end
