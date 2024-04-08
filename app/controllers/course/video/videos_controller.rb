# frozen_string_literal: true
class Course::Video::VideosController < Course::Video::Controller
  skip_load_and_authorize_resource :video, only: [:create]
  build_and_authorize_new_lesson_plan_item :video, class: Course::Video, through: :course, only: [:create]
  before_action :load_video_tabs

  def index
    respond_to do |format|
      format.json do
        @can_analyze = can_for_videos_in_current_course? :analyze
        @can_manage = can_for_videos_in_current_course? :manage

        preload_student_submission_count if @can_analyze
        preload_video_item
        @videos = @videos.
                  from_tab(current_tab).
                  includes(:statistic).
                  with_submissions_by(current_user)

        @course_students = current_course.course_users.students
      end
    end
  end

  def show
    respond_to do |format|
      format.json { render 'show' }
    end
  end

  def create
    if @video.save
      respond_to do |format|
        format.json { render 'show' }
      end
    else
      render json: { errors: @video.errors }, status: :bad_request
    end
  end

  def update
    if @video.update(video_params)
      respond_to do |format|
        format.json { render 'show' }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @video.errors }, status: :bad_request }
      end
    end
  end

  def destroy
    if @video.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def can_for_videos_in_current_course?(ability)
    can? ability, Course::Video.new(course_id: current_course.id)
  end

  def video_params
    params.require(:video).
      permit(:title, :tab_id, :description, :start_at, :url, :published, :has_personal_times,
             :has_todo)
  end

  def current_tab
    @tab ||= if @video&.tab.present?
               @video.tab
             elsif params[:tab].present?
               Course::Video::Tab.find(params[:tab])
             else
               current_course.default_video_tab
             end
  end

  def load_video_tabs
    @video_tabs = current_course.video_tabs
  end

  def preload_video_item
    @video_items_hash = @course.lesson_plan_items.where(actable_id: @videos.pluck(:id),
                                                        actable_type: Course::Video.name).
                        preload(actable: :conditions).
                        with_reference_times_for(current_course_user, current_course).
                        with_personal_times_for(current_course_user).
                        to_h do |item|
      [item.actable_id, item]
    end
  end

  def preload_student_submission_count
    @video_submission_count_hash = @videos.calculated(:student_submission_count).
                                   to_h do |video|
      [video.id, video.student_submission_count]
    end
  end
end
