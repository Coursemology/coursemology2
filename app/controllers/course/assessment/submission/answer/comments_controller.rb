# frozen_string_literal: true
class Course::Assessment::Submission::Answer::CommentsController < \
  Course::Assessment::Submission::Answer::Controller

  include Course::Discussion::PostsConcern
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  delegate :discussion_topic, to: :@answer

  def destroy
    render status: :bad_request unless super
  end
end
