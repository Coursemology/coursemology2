# frozen_string_literal: true
class Course::GradebookController < Course::ComponentController
  before_action :authorize_read_gradebook!

  def index
    respond_to do |format|
      format.json do
        @weighted_view_enabled = @settings.weighted_view_enabled
        @published_assessments = fetch_published_assessments
        @categories, @tabs = fetch_categories_and_tabs
        @students = fetch_students
        assessment_ids = @published_assessments.pluck(:id)
        load_weighted_view_contributions(assessment_ids) if @weighted_view_enabled
        @assessment_max_grades = Course::Assessment.max_grades(assessment_ids)
        @submissions = Course::Assessment::Submission.grade_summary(
          student_ids: @students.map(&:user_id),
          assessment_ids: assessment_ids
        )
        load_externals
      end
    end
  end

  def update_weights
    authorize! :manage_gradebook_weights, current_course
    updates = update_weights_params[:weights].map { |entry| parse_weight_entry(entry) }
    Course::Gradebook::Contribution.bulk_update(course: current_course, updates: updates)
    render json: { weights: serialize_weight_updates(updates) }
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  private

  def authorize_read_gradebook!
    authorize! :read_gradebook, current_course
  end

  def load_weighted_view_contributions(assessment_ids)
    @tab_contributions = Course::Gradebook::Contribution.
                         where(tab_id: @tabs.map(&:id)).index_by(&:tab_id)
    @assessment_contributions = Course::Gradebook::AssessmentContribution.
                                where(assessment_id: assessment_ids).index_by(&:assessment_id)
  end

  def parse_weight_entry(entry)
    {
      tab_id: entry[:tabId].to_i,
      weight: entry[:weight].to_f,
      weight_mode: entry[:weightMode] || 'equal',
      excluded_assessment_ids: (entry[:excludedAssessmentIds] || []).map(&:to_i),
      assessment_weights: (entry[:assessmentWeights] || []).map do |aw|
        { assessment_id: aw[:assessmentId].to_i, weight: aw[:weight].to_f }
      end
    }
  end

  def update_weights_params
    params.permit(
      weights: [:tabId, :weight, :weightMode,
                excludedAssessmentIds: [], assessmentWeights: [:assessmentId, :weight]]
    )
  end

  def serialize_weight_updates(updates)
    updates.map do |u|
      entry = { tabId: u[:tab_id], weight: u[:weight], weightMode: u[:weight_mode].to_s,
                excludedAssessmentIds: u[:excluded_assessment_ids] }
      if u[:weight_mode].to_s == 'custom'
        entry[:assessmentWeights] = u[:assessment_weights].map do |aw|
          { assessmentId: aw[:assessment_id], weight: aw[:weight] }
        end
      end
      entry
    end
  end

  def component
    current_component_host[:course_gradebook_component]
  end

  def fetch_categories_and_tabs
    tabs = @published_assessments.map(&:tab).uniq(&:id)
    [tabs.map(&:category).uniq(&:id), tabs]
  end

  def load_externals
    @external_assessments = Course::ExternalAssessment.for_course(current_course).
                            includes(:gradebook_contribution, external_assessment_grades: :course_user).to_a
    @external_grades = @external_assessments.flat_map(&:external_assessment_grades)
    @external_contributions = @external_assessments.
                              index_by(&:id).
                              transform_values(&:gradebook_contribution)
  end

  def fetch_students
    current_course.levels.to_a
    current_course.course_users.students.without_phantom_users.
      calculated(:experience_points).includes(:user).to_a.
      sort_by { |cu| cu.user.name }
  end

  def fetch_published_assessments
    current_course.assessments.
      published.
      includes(tab: :category).
      joins(tab: :category).
      reorder('course_assessment_categories.weight, course_assessment_tabs.weight, course_assessments.id')
  end
end
