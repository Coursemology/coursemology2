# frozen_string_literal: true
class Course::GradebookController < Course::ComponentController
  before_action :authorize_read_gradebook!
  before_action :preload_levels, only: [:index]

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
      end
    end
  end

  def update_weights
    authorize! :manage_gradebook_weights, current_course
    updates = (update_weights_params[:weights] || []).map { |entry| parse_weight_entry(entry) }
    Course::Gradebook::TabContribution.bulk_update(course: current_course, updates: updates)
    render json: { weights: serialize_weight_updates(updates) }
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  private

  def authorize_read_gradebook!
    authorize! :read_gradebook, current_course
  end

  def load_weighted_view_contributions(assessment_ids)
    @tab_contributions = Course::Gradebook::TabContribution.
                         where(tab_id: @tabs.map(&:id)).index_by(&:tab_id)
    @assessment_contributions = Course::Gradebook::AssessmentContribution.
                                where(assessment_id: assessment_ids).index_by(&:assessment_id)
  end

  # Weights are stored as DECIMAL(5,2); round at the boundary so the echoed response
  # matches the persisted value and the custom-weight sum check stays exact at 2dp.
  def parse_weight_entry(entry)
    {
      tab_id: entry[:tabId].to_i,
      weight: entry[:weight].to_f.round(2),
      weight_mode: entry[:weightMode] || 'equal',
      excluded_assessment_ids: (entry[:excludedAssessmentIds] || []).map(&:to_i),
      assessment_weights: (entry[:assessmentWeights] || []).map do |aw|
        { assessment_id: aw[:assessmentId].to_i, weight: aw[:weight].to_f.round(2) }
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

  def fetch_students
    current_course.course_users.students.without_phantom_users.
      calculated(:experience_points).includes(user: :emails).to_a
  end

  def fetch_published_assessments
    current_course.assessments.
      published.
      includes(tab: :category).
      joins(tab: :category).
      reorder('course_assessment_categories.weight, course_assessment_tabs.weight, course_assessments.id')
  end

  # Pre-loads course levels to avoid N+1 queries when each course_user.level_number is rendered.
  # level_number is derived, not an association (it buckets EXP against course.levels), so it
  # can't be added to fetch_students' includes. See Course::LevelsConcern#level_for.
  def preload_levels
    current_course.levels.to_a
  end
end
