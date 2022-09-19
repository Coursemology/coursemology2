# frozen_string_literal: true
class Course::Admin::MaterialSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_materials_path

  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(material_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def material_settings_params
    params.require(:settings_materials_component).permit(:title)
  end

  def component
    current_component_host[:course_materials_component]
  end
end
