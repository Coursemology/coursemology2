# frozen_string_literal: true
json.assessments @scholaistic_assessments do |scholaistic_assessment|
  json.id scholaistic_assessment.id
  json.title scholaistic_assessment.title
  json.startAt scholaistic_assessment.start_at
  json.endAt scholaistic_assessment.end_at
  json.published scholaistic_assessment.published?
  json.isStartTimeBegin scholaistic_assessment.start_at <= Time.zone.now
  json.isEndTimePassed scholaistic_assessment.end_at.present? && scholaistic_assessment.end_at < Time.zone.now
  json.status @assessments_status[scholaistic_assessment.id]
  json.baseExp scholaistic_assessment.base_exp if current_course.gamified? && (scholaistic_assessment.base_exp > 0)
end

json.display do
  json.assessmentsTitle current_course.settings(:course_scholaistic_component).assessments_title
  json.isStudent current_course_user&.student? || false
  json.isGamified current_course.gamified?
  json.canEditAssessments can?(:edit, Course::ScholaisticAssessment.new(course: current_course))
  json.canCreateAssessments can?(:create, Course::ScholaisticAssessment.new(course: current_course))
  json.canViewSubmissions can?(:view_submissions, Course::ScholaisticAssessment.new(course: current_course))
end
