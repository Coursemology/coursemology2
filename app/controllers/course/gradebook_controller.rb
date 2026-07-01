# frozen_string_literal: true
class Course::GradebookController < Course::ComponentController # rubocop:disable Metrics/ClassLength
  before_action :authorize_read_gradebook!
  before_action :preload_levels, only: [:index]

  def index
    respond_to do |format|
      format.json do
        @weighted_view_enabled = @settings.weighted_view_enabled
        @published_assessments = fetch_published_assessments
        @categories, @tabs = fetch_categories_and_tabs
        @students = fetch_students
        @course_max_level = [current_course.levels.count - 1, 0].max
        assessment_ids = @published_assessments.pluck(:id)
        load_weighted_view(assessment_ids) if @weighted_view_enabled
        load_grades(assessment_ids)
        @student_level_contributions = compute_student_level_contributions
      end
    end
  end

  def update_weights
    authorize! :manage_gradebook_weights, current_course
    updates = (update_weights_params[:weights] || []).map { |entry| parse_weight_entry(entry) }
    level_config = nil
    # One transaction so a rejected level formula rolls back the tab-weight writes too,
    # rather than leaving a partial save.
    ActiveRecord::Base.transaction do
      Course::Gradebook::TabContribution.bulk_update(course: current_course, updates: updates)
      level_config = persist_level_contribution
    end
    response_body = { weights: serialize_weight_updates(updates) }
    response_body[:levelContribution] = serialize_level_contribution(level_config) if level_config
    render json: response_body
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  private

  def authorize_read_gradebook!
    authorize! :read_gradebook, current_course
  end

  def load_weighted_view(assessment_ids)
    @level_config = current_course.gradebook_level_config
    load_weighted_view_contributions(assessment_ids)
  end

  def load_weighted_view_contributions(assessment_ids)
    @tab_contributions = Course::Gradebook::TabContribution.
                         where(tab_id: @tabs.map(&:id)).index_by(&:tab_id)
    @assessment_contributions = Course::Gradebook::AssessmentContribution.
                                where(assessment_id: assessment_ids).index_by(&:assessment_id)
  end

  def load_grades(assessment_ids)
    @assessment_max_grades = Course::Assessment.max_grades(assessment_ids)
    @submissions = Course::Assessment::Submission.grade_summary(
      student_ids: @students.map(&:user_id),
      assessment_ids: assessment_ids
    )
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
    }.merge(parse_keep_highest(entry))
  end

  # Only forward keepHighest when the client actually sent it, so an omitted field
  # retains the previously persisted value rather than resetting to 0 downstream.
  def parse_keep_highest(entry)
    return {} unless entry.key?(:keepHighest)

    { keep_highest: entry[:keepHighest].to_i }
  end

  def update_weights_params
    params.permit(
      weights: [:tabId, :weight, :weightMode, :keepHighest,
                excludedAssessmentIds: [], assessmentWeights: [:assessmentId, :weight]]
    )
  end

  def persist_level_contribution
    attrs = level_contribution_attrs
    return nil if attrs.nil?

    Course::Gradebook::LevelConfig.upsert_for(course: current_course, attrs: attrs)
  end

  def level_contribution_attrs
    lc = params[:levelContribution]
    return nil if lc.blank?

    permitted = lc.permit(:enabled, :formula, :weight, :show, :clamp, formulaAst: {})
    formula_ast = permitted[:formulaAst]
    attrs = {
      enabled: permitted[:enabled],
      formula: permitted[:formula],
      formula_ast: formula_ast.present? ? formula_ast.to_h : nil,
      weight: permitted[:weight],
      show: permitted[:show]
    }
    # Only forward :clamp when the client actually sent it, so LevelConfig.upsert_for's
    # default-true fallback applies on omission rather than persisting NULL.
    attrs[:clamp] = permitted[:clamp] if permitted.key?(:clamp)
    attrs
  end

  def serialize_level_contribution(config)
    {
      enabled: config.enabled,
      formula: config.formula,
      weight: config.weight.to_f,
      show: config.show,
      clamp: config.clamp
    }
  end

  def serialize_weight_updates(updates)
    updates.map do |u|
      entry = { tabId: u[:tab_id], weight: u[:weight], weightMode: u[:weight_mode].to_s,
                keepHighest: u[:keep_highest],
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
      calculated(:experience_points).includes(user: :emails).to_a.
      sort_by { |cu| cu.user.name }
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

  def compute_student_level_contributions
    return {} unless @level_config&.enabled

    @students.to_h do |cu|
      [cu.user_id, @level_config.evaluate_for(level: cu.level_number)]
    end
  end
end
