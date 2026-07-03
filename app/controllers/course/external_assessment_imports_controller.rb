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
    Service.new(
      course: current_course,
      actor: current_user,
      identifier_mode: permitted_params[:identifierMode],
      identifier_column: permitted_params[:identifierColumn],
      csv_data: permitted_params[:csvData],
      mappings: (permitted_params[:mappings] || []).map do |m|
        { header: m[:header], action: m[:action], target: m[:target],
          max_grade: m[:maxGrade].presence&.to_f, weight: m[:weight].presence&.to_f }
      end
    )
  end

  def import_params
    @import_params ||= params.permit(
      :identifierMode, :identifierColumn, :csvData, :onConflict,
      mappings: [:header, :action, :target, :maxGrade, :weight]
    )
  end
end
