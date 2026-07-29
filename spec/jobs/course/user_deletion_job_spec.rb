# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserDeletionJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:user) { create(:course_manager, course: course).user }
    let!(:student) { create(:course_student, course: course) }
    subject { Course::UserDeletionJob }

    before do
      subject.instance_variable_set(:@course, course)
      subject.instance_variable_set(:@course_user, student)
      subject.instance_variable_set(:@current_user, user)
    end

    it 'can be queued' do
      expect { subject.perform_later(course, student, user) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'delete one user upon successful course user deletion', :sidekiq_same_thread do
      expect do
        perform_sidekiq_jobs { subject.perform_later(course, student, user) }
      end.to change { course.course_users.count }.by(-1)
    end

    it 'sends failure email upon failing course user deletion', :sidekiq_same_thread do
      # The job operates on a deserialised course_user, so stub any instance (not just `student`).
      allow_any_instance_of(CourseUser).to receive(:destroy).and_return(false)

      perform_sidekiq_jobs { subject.perform_later(course, student, user) }

      emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
      email_subjects = ActionMailer::Base.deliveries.map(&:subject)

      expect(ActionMailer::Base.deliveries.count).to eq(1)
      expect(emails).to include(user.email)
      expect(email_subjects).to include('course.mailer.course_user_deletion_failed_email.subject')
    end
  end
end
