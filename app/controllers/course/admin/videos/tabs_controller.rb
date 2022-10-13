# frozen_string_literal: true
class Course::Admin::Videos::TabsController < Course::Admin::Controller
  load_and_authorize_resource :tab,
                              through: :course,
                              through_association: :video_tabs,
                              class: Course::Video::Tab.name

  add_breadcrumb :index, :course_admin_videos_path

  def new
  end

  def create
    if @tab.save
      render 'course/admin/video_settings/edit'
    else
      render json: { errors: @tab.errors }, status: :bad_request
    end
  end

  def destroy
    if @tab.destroy
      render 'course/admin/video_settings/edit'
    else
      render json: { errors: @tab.errors }, status: :bad_request
    end
  end

  private

  def tab_params
    params.require(:tab).permit(:title, :weight)
  end

  # @return [Course::VideosComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_videos_component]
  end
end
