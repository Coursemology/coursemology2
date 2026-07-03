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
          max_grade: m[:maxGrade].presence&.to_f, weight: mapping_weight(m) }
      end
    )
  end

  # Weights only mean anything in the weighted view. Zero any incoming weight when
  # the view is disabled so a stale request can't write a non-zero weight into a
  # course that isn't weighting grades.
  def mapping_weight(mapping)
    return 0 unless @settings.weighted_view_enabled

    mapping[:weight].presence&.to_f
  end

  def import_params
    @import_params ||= params.permit(
      :identifierMode, :identifierColumn, :csvData, :onConflict,
      mappings: [:header, :action, :target, :maxGrade, :weight]
    )
  end
end
