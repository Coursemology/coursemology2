# frozen_string_literal: true
class Course::VideoSubmissionsController < Course::ComponentController
  include Course::UsersBreadcrumbConcern

  load_resource :course_user, through: :course, id_param: :user_id
  before_action :authorize_analyze_video!
  before_action :load_video_submissions
  before_action :add_breadcrumbs

  def index
    @videos = @course.videos.ordered_by_date_and_title
    @video_submissions_hash = @video_submissions.
                              includes([:video, { experience_points_record: :course_user },
                                        :statistic]).to_h { |s| [s.video.id, s] }
  end

  private

  def add_breadcrumbs
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
    @video_submissions = Course::Video::Submission.by_user(@course_user.user)
  end

  def authorize_analyze_video!
    authorize!(:analyze_videos, current_course)
  end
end
