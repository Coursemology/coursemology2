# frozen_string_literal: true
class Course::Video::Submission::SubmissionsController < Course::Video::Submission::Controller
  before_action :authorize_video!, only: :create
  skip_authorize_resource :submission, only: :edit

  def index
    authorize!(:manage, @video)
    @submissions = @submissions.includes(experience_points_record: :course_user)
    @my_students = current_course_user.try(:my_students) || []
    @course_students = current_course.course_users.students.order_alphabetically
  end

  def create
    if @submission.save
      redirect_to edit_course_video_submission_path(current_course, @video, @submission)
    elsif @submission.existing_submission.present?
      redirect_to edit_course_video_submission_path(current_course,
                                                    @video,
                                                    @submission.existing_submission)
    else
      redirect_to course_videos_path(current_course),
                  danger: t('.failure', error: @submission.errors.full_messages.to_sentence)
    end
  end

  def edit
    # @submission is normally authorized in the super controller, and has to be manually authorized
    # here for a custom access denied behaviour to be implemented
    authorize!(:edit, @submission)

    @topics = @video.topics.includes(posts: :children).order(:timestamp)
    @topics = @topics.reject { |topic| topic.posts.empty? }
    @posts = @topics.map(&:posts).inject(Course::Discussion::Post.none, :+)
    @scroll_topic_id = scroll_topic_params
    # TODO: Re-enable when video sessions are fixed
    # create_session
  rescue CanCan::AccessDenied
    redirect_to course_video_path(current_course, @video)
  end

  private

  def create_params
    { course_user: current_course_user }
  end

  def scroll_topic_params
    params[:scroll_to_topic]
  end

  def authorize_video!
    authorize!(:attempt, @video)
  end

  def create_session
    return unless current_course_user.student? && @submission.course_user == current_course_user
    time_now = Time.zone.now
    @session = @submission.sessions.create!(session_start: time_now, session_end: time_now)
  end

  def current_tab
    @video.tab
  end
end
