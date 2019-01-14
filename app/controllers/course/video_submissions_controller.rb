# frozen_string_literal: true
class Course::VideoSubmissionsController < Course::ComponentController
  include Course::UsersBreadcrumbConcern

  load_resource :course_user, through: :course, id_param: :user_id
  before_action :authorize_analyze_video!
  before_action :load_video_submissions
  before_action :add_breadcrumbs

  def index # :nodoc:
    @videos = @course.videos
    @video_submissions = @video_submissions.
                         includes([:video, { experience_points_record: :course_user }, :statistic]).
                         page(page_param)
  end

  private

  def add_breadcrumbs # :nodoc:
    add_breadcrumb @course_user.name, course_user_path(current_course, @course_user)
    add_breadcrumb :index
  end

  # @return [Course::VideosComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_videos_component]
  end

  # Load video submissions.
  def load_video_submissions
    @video_submissions = Course::Video::Submission.by_user(@course_user.user).page(page_param)
  end

  def authorize_analyze_video!
    authorize!(:analyze_videos, current_course)
  end
end
