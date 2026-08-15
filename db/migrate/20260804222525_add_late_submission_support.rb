# frozen_string_literal: true
class AddLateSubmissionSupport < ActiveRecord::Migration[8.0]
  def change
    # When false, students may not create or edit submissions past the assessment deadline; any
    # attempting submission is force-submitted at the deadline instead. Defaults to true to preserve
    # the existing behaviour (late submissions permitted, merely flagged) for all existing records.
    add_column :course_assessments, :is_late_submission_allowed, :boolean, default: true, null: false

    # Set when a submission is unsubmitted by staff, and cleared when it is (re-)finalised. A present
    # value marks a submission that a student is redoing with explicit staff permission; such a
    # submission is exempt from deadline enforcement and force submission. Distinct from submitted_at,
    # which unsubmit nils and which statistics rely on to mean "was submitted".
    add_column :course_assessment_submissions, :unsubmitted_at, :datetime

    # The force-submit time a job was last scheduled for. Lets the scheduling sweep skip submissions
    # already scheduled for their current force-submit time, and reschedule those whose deadline (or
    # personal time) has since changed. See ScheduleExpiringSubmissionsJob.
    add_column :course_assessment_submissions, :force_submit_scheduled_at, :datetime
  end
end
