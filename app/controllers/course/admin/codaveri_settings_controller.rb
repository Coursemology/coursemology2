# frozen_string_literal: true
class Course::Admin::CodaveriSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_codaveri_path

  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(codaveri_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def codaveri_settings_params
    params.require(:settings_codaveri_component).permit(:is_only_itsp, :is_solution_required)
  end

  def component
    current_component_host[:course_codaveri_component]
  end
end
