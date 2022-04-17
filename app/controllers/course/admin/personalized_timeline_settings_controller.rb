# frozen_string_literal: true
class Course::Admin::PersonalizedTimelineSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_personalized_timeline_path

  def edit
    settings = current_course.settings_personalized_timeline
    assessments = current_course.assessments.with_default_reference_time.published.pluck(:start_at, :end_at)
    @earliest_open_at = assessments.map { |a| a[0] }.min
    @latest_end_at = assessments.map { |a| a[1] }.compact.max
    @min_overall_limit = settings&.min_overall_limit ||
                         Course::LessonPlan::Strategies::FomoPersonalizationStrategy::MIN_OVERALL_LIMIT
    @max_overall_limit = settings&.max_overall_limit ||
                         Course::LessonPlan::Strategies::StragglersPersonalizationStrategy::MAX_OVERALL_LIMIT
    @hard_min_learning_rate = settings&.hard_min_learning_rate
    @hard_max_learning_rate = settings&.hard_max_learning_rate
    @assessment_submission_time_weight = settings&.assessment_submission_time_weight || 1
    @assessment_grade_weight = settings&.assessment_grade_weight || 0
    @video_watch_percentage_weight = settings&.video_watch_percentage_weight || 0
  end

  def learning_rates
    students = current_course.course_users.students.includes(:learning_rate_records).to_a
    @records = students.map { |s| [s.id, s.learning_rate_records.to_a.sort_by(&:created_at)] }
  end

  private

  def component
    current_component_host[:course_users_component]
  end
end
