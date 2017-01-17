# frozen_string_literal: true
class Course::Video::Submission::Controller < Course::Video::Controller
  load_and_authorize_resource :submission, class: Course::Video::Submission.name, through: :video
  before_action :add_video_breadcrumb

  protected

  def add_video_breadcrumb
    add_breadcrumb(@video.title, course_video_path(current_course, @video))
  end
end
