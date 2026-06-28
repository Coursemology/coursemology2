# frozen_string_literal: true
class Course::ExternalAssessmentImportsController < Course::ComponentController
  Service = Course::Gradebook::ExternalAssessmentImportService

  def preview
    authorize! :manage_gradebook_weights, current_course
    @result = build_service.preview
    render 'preview'
  rescue Service::ImportError => e
    render json: { errors: e.payload }, status: :unprocessable_entity
  end

  def create
    authorize! :manage_gradebook_weights, current_course
    @summary = build_service.commit(on_conflict: import_params[:onConflict])
    render 'create'
  rescue Service::ImportError => e
    render json: { errors: e.payload }, status: :unprocessable_entity
  end

  private

  def component
    current_component_host[:course_gradebook_component]
  end

  def build_service
    permitted_params = import_params
    weighted_view_enabled = gradebook_settings.weighted_view_enabled
    Service.new(
      course: current_course,
      actor: current_user,
      components: permitted_params[:components].map do |c|
        { name: c[:name],
          weightage: weighted_view_enabled ? c[:weightage].to_i : 0,
          maximum_grade: c[:maximumGrade].to_f }
      end,
      identifier_mode: permitted_params[:identifierMode],
      csv_data: permitted_params[:csvData]
    )
  end

  def gradebook_settings
    @gradebook_settings ||= Course::Settings::GradebookComponent.new(component)
  end

  def import_params
    @import_params ||= params.slice(:identifierMode, :csvData, :onConflict, :components).permit(
      :identifierMode, :csvData, :onConflict,
      components: [:name, :weightage, :maximumGrade]
    )
  end
end
