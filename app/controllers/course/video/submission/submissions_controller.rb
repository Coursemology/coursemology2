# frozen_string_literal: true
class Course::Video::Submission::SubmissionsController < Course::Video::Submission::Controller
  before_action :authorize_attempt_video!, only: :create
  before_action :authorize_analyze_video!, only: [:index, :show]
  skip_authorize_resource :submission, only: :edit

  def index
    respond_to do |format|
      format.json do
        @submissions = @submissions.includes([{ experience_points_record: :course_user }, :statistic])
        @my_students = current_course_user.try(:my_students) || []
        @course_students = current_course.course_users.students.order_alphabetically
      end
    end
  end

  def show
    respond_to do |format|
      format.json do
        @sessions = @submission.sessions.with_events_present
      end
    end
  end

  def create
    if @submission.save
      render json: { submissionId: @submission.id }
    elsif @submission.existing_submission.present?
      render json: { submissionId: @submission.existing_submission.id }
    else
      render json: { errors: @submission.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def edit
    # @submission is normally authorized in the super controller, and has to be manually authorized
    # here for a custom access denied behaviour to be implemented
    authorize!(:edit, @submission)

    respond_to do |format|
      format.json do
        @topics = @video.topics.includes(posts: :children).order(:timestamp)
        @topics = @topics.reject { |topic| topic.posts.empty? }
        @posts = @topics.map(&:posts).reduce(Course::Discussion::Post.none, :+)
        set_seek_and_scroll
        set_monitoring
      end
    end
  end

  private

  def create_params
    { course_user: current_course_user }
  end

  def scroll_topic_params
    params[:scroll_to_topic]
  end

  def seek_time_params
    params[:seek_time]&.to_i
  end

  def authorize_attempt_video!
    authorize!(:attempt, @video)
  end

  def authorize_analyze_video!
    authorize!(:analyze, @video)
  end

  def set_seek_and_scroll
    @scroll_topic_id = scroll_topic_params
    @seek_time = seek_time_params
    @seek_time = @video.topics.find(@scroll_topic_id).timestamp if @scroll_topic_id.present?
  end

  def set_monitoring
    @enable_monitoring =
      current_course_user.student? && @submission.course_user == current_course_user
  end

  def current_tab
    @video.tab
  end
end
