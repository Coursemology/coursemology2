# frozen_string_literal: true
class Course::Admin::Videos::TabsController < Course::Admin::Controller
  load_and_authorize_resource :tab,
                              through: :course,
                              through_association: :video_tabs,
                              class: Course::Video::Tab.name

  add_breadcrumb :index, :course_admin_videos_path

  def new; end

  def create
    if @tab.save
      redirect_to course_admin_videos_path(current_course),
                  success: t('.success', title: @tab.title)
    else
      render 'new'
    end
  end

  def destroy
    if @tab.destroy
      redirect_to course_admin_videos_path(current_course),
                  success: t('.success', title: @tab.title)
    else
      redirect_to course_admin_videos_path(current_course),
                  danger: t('.failure', error: @tab.errors.full_messages.to_sentence)
    end
  end

  private

  def tab_params
    params.require(:tab).permit(:title, :weight)
  end
end
