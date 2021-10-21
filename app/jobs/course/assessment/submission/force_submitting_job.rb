# frozen_string_literal: true
class Course::Assessment::Submission::ForceSubmittingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(assessment, user_ids_without_submission, submitter)
    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      force_create_and_submit_submissions(assessment, user_ids_without_submission, submitter)
    end

    redirect_to course_assessment_submissions_path(assessment.course, assessment)
  end

  private

  # Force creates unattempted submissions and submits all attempting submissions for a given assessment.
  # @param [Course::Assessment] assessment The assessment of which the submissions are to be force submitted.
  # @param [User] submitter The user object who would be submitting the submission.
  def force_create_and_submit_submissions(assessment, user_ids_without_submission, submitter)
    User.with_stamper(submitter) do
      ActiveRecord::Base.transaction do
        user_ids_without_submission.each do |user|
          course_user = assessment.course.course_users.find_by(user: user)
          create_submission(assessment, course_user)
        end

        assessment.submissions.with_attempting_state.each do |submission|
          submission.update('finalise' => 'true')
          grade_submission(assessment, submission)
        end
      end
    end
  end

  def create_submission(assessment, course_user)
    submission = assessment.submissions.new(creator: course_user.user, course_user: course_user)

    assessment.submissions.new(creator: course_user.user)
    success = assessment.create_new_submission(submission, course_user)

    submission.create_new_answers if success
  end

  def grade_submission(assessment, submission)
    if assessment.autograded
      submission.auto_grade_now!
    else
      grade_answers(submission)

      # Award points and mark/publish
      if assessment.delayed_grade_publication
        submission.mark!
        submission.draft_points_awarded = 0
      else
        submission.points_awarded = 0
        submission.publish!(_ = nil, send_email: false)
      end
      submission.save!
    end
  end

  def grade_answers(submission)
    submission.current_answers.each do |answer|
      answer.evaluate!
      answer.grade = 0
      answer.grader = User.system
      answer.graded_at = Time.zone.now
      answer.save!
    end
  end
end
