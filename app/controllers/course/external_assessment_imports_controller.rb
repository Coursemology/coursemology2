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
    @summary = build_service.commit(on_conflict: params[:onConflict])
    render 'create'
  rescue Service::ImportError => e
    render json: { errors: e.payload }, status: :unprocessable_entity
  end

  private

  def component
    current_component_host[:course_gradebook_component]
  end

  def build_service
    Service.new(
      course: current_course,
      actor: current_user,
      components: import_params[:components].map do |c|
        { name: c[:name], weightage: c[:weightage].to_i, maximum_grade: c[:maximumGrade].to_f }
      end,
      identifier_mode: import_params[:identifierMode],
      csv_data: import_params[:csvData]
    )
  end

  def import_params
    params.permit(
      :identifierMode, :csvData, :onConflict,
      components: [:name, :weightage, :maximumGrade]
    )
  end
end
