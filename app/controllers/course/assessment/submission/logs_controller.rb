# frozen_string_literal: true
class Course::Assessment::Submission::LogsController < \
  Course::Assessment::Submission::Controller

  add_breadcrumb :submissions, :course_assessment_submissions_path
  add_breadcrumb :index, :course_assessment_submission_logs_path

  def index
    authorize!(:manage, @assessment)
  end
end
