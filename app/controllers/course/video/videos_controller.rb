# frozen_string_literal: true
class Course::Video::VideosController < Course::Video::Controller
  skip_load_and_authorize_resource :video, only: [:new, :create]
  build_and_authorize_new_lesson_plan_item :video, class: Course::Video, through: :course, only: [:new, :create]

  def index #:nodoc:
    @videos = @videos.
              from_tab(current_tab).
              ordered_by_date_and_title.
              with_submissions_by(current_user)

    @course_students = current_course.course_users.students
  end

  def show; end

  def new
    @video.tab = current_tab
  end

  def create
    if @video.save
      redirect_to course_videos_path(current_course, tab: @video.tab),
                  success: t('.success', title: @video.title)
    else
      render 'new'
    end
  end

  def edit; end

  def update
    if @video.update(video_params)
      redirect_to course_videos_path(current_course, tab: @video.tab),
                  success: t('.success', title: @video.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @video.destroy
      redirect_to course_videos_path(current_course), success: t('.success', title: @video.title)
    else
      redirect_to course_videos_path(current_course),
                  danger: t('.failure', error: @video.errors.full_messages.to_sentence)
    end
  end

  private

  def video_params
    params.require(:video).permit(:title, :tab_id, :description, :start_at, :url, :published, :has_personal_times)
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
end
