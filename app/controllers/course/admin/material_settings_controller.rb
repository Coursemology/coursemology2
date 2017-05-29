# frozen_string_literal: true
class Course::Admin::MaterialSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_materials_path

  def edit
  end

  def update
    if @settings.update(material_settings_params) && current_course.save
      redirect_to course_admin_materials_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def material_settings_params #:nodoc:
    params.require(:settings_materials_component).permit(:title)
  end

  def component
    current_component_host[:course_materials_component]
  end
end
