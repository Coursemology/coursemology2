# frozen_string_literal: true
class Course::Admin::LessonPlanSettingsController < Course::Admin::Controller
  before_action :load_item_settings
  add_breadcrumb :edit, :course_admin_lesson_plan_path

  def edit
    @page_data = page_data.to_json
  end

  def update
    if update_lesson_plan_items_settings &&
       update_lesson_plan_component_settings &&
       current_course.save
      render json: page_data
    else
      head :bad_request
    end
  end

  private

  def update_lesson_plan_items_settings
    item_settings_params = lesson_plan_item_settings_params[:lesson_plan_item_settings]
    item_settings_params.nil? || @item_settings.update(item_settings_params)
  end

  def update_lesson_plan_component_settings
    component_settings_params = lesson_plan_item_settings_params[:lesson_plan_component_settings]
    component_settings_params.nil? || @settings.update(component_settings_params)
  end

  def lesson_plan_item_settings_params
    params.require(:lesson_plan_settings).permit(
      lesson_plan_item_settings: {},
      lesson_plan_component_settings: [:milestones_expanded]
    )
  end

  def load_item_settings
    @item_settings = Course::Settings::LessonPlanItems.new(current_component_host.components)
  end

  def page_data
    {
      items_settings: @item_settings.lesson_plan_item_settings,
      component_settings: { milestones_expanded: @settings.milestones_expanded }
    }
  end

  def component
    current_component_host[:course_lesson_plan_component]
  end
end
