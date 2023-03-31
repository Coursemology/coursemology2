# frozen_string_literal: true
class Course::Assessment::Submission::LogsController < \
  Course::Assessment::Submission::Controller

  def index
    authorize!(:manage, @assessment)
  end
end
