# frozen_string_literal: true
class Course::Video::VideosController < Course::Video::Controller
  def index #:nodoc:
    @videos = @videos.ordered_by_date.with_submissions_by(current_user)
  end

  def show; end

  def new; end

  def create
    if @video.save
      redirect_to course_videos_path(current_course), success: t('.success', title: @video.title)
    else
      render 'new'
    end
  end

  def edit; end

  def update
    if @video.update(video_params)
      redirect_to course_videos_path(current_course), success: t('.success', title: @video.title)
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
    params.require(:video).permit(:title, :description, :start_at, :url, :published)
  end
end
