# frozen_string_literal: true
class Course::Admin::LessonPlanSettingsController < Course::Admin::Controller
  before_action :load_item_settings
  add_breadcrumb :edit, :course_admin_lesson_plan_path

  def edit
    @page_data = @item_settings.lesson_plan_item_settings.to_json
  end

  def update
    if @item_settings.update(lesson_plan_item_settings_params['lesson_plan_item_settings']) &&
       current_course.save
      render json: @item_settings.lesson_plan_item_settings
    else
      head :bad_request
    end
  end

  private

  def lesson_plan_item_settings_params
    params.require(:lesson_plan_settings).permit(lesson_plan_item_settings: {})
  end

  def load_item_settings
    @item_settings = Course::Settings::LessonPlanItems.new(current_component_host.components)
  end
end
