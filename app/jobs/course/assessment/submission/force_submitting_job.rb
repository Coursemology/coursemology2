# frozen_string_literal: true
# This job performs creation of new submissions (if there is none yet), submits and grades any unsubmitted submissions
# in an assessment for all students. The submissions will be graded zero if it is of an non-autogradeable assessment.
class Course::Assessment::Submission::ForceSubmittingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Performs the force submitting job.
  #
  # @param [Course::Assessment] assessment The assessment of which the submissions are to be force submitted.
  # @param [Array<Integer>] user_ids_without_submission User Ids who have not created any submission.
  # @param [User] submitter The user object who would be submitting the submission.
  def perform_tracked(assessment, user_ids_without_submission, submitter)
    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      force_create_and_submit_submissions(assessment, user_ids_without_submission, submitter)
    end

    redirect_to course_assessment_submissions_path(assessment.course, assessment)
  end

  private

  # Force creates unattempted submissions and submits all attempting submissions for a given assessment.
  #
  # @param [Course::Assessment] assessment The assessment of which the submissions are to be force submitted.
  # @param [Array<Integer>] user_ids_without_submission Ids of users who have not created any submission.
  # @param [User] submitter The user object who would be force submitting the submission.
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

  # Creates a new submission and answers to the submission for a given course user.
  #
  # @param [Course::Assessment] assessment The assessment of which a submission is to be created.
  # @param [CourseUser] course_user The course user whose submission is to be created.
  def create_submission(assessment, course_user)
    submission = assessment.submissions.new(creator: course_user.user, course_user: course_user)

    assessment.submissions.new(creator: course_user.user)
    success = assessment.create_new_submission(submission, course_user)

    submission.create_new_answers if success
  end

  # Force submit and grade all unsubmitted submissions. For autograded assessment, the submission will be graded.
  # For non-autograded assessment, the submission will be graded to be zero.
  #
  # @param [Course::Assessment] assessment The assessment of which the submissions are to be graded.
  # @param [Course::Assessment::Submission] submission The submission to be graded.
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

  # Grade answers to zero for a non-autograded submission.
  #
  # @param [Course::Assessment::Submission] submission The submission to be graded zero.
  def grade_answers(submission)
    submission.current_answers.each do |answer|
      answer.evaluate!
      answer.grade = 0
      answer.grader = User.stamper
      answer.graded_at = Time.zone.now
      answer.save!
    end
  end
end
