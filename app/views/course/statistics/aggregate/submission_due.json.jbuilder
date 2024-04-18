# frozen_string_literal: true
json.name @all_students.first.name

json.assessments @assessments do |assessment|
  student_id = @all_students.first.id
  submission_info = @submissions[[assessment.id, student_id]]
  timeline = @personal_timeline[[assessment.id, student_id]] || @reference_timeline[assessment.id]
  _, reference_end_at, = @reference_timeline[assessment.id]

  start_at, end_at, is_fixed = timeline

  if submission_info
    submission_id, workflow_state, = submission_info

    next if workflow_state != 'attempting'

    json.submissionId submission_id
    json.workflowState workflow_state
  else
    is_not_released_to_student = Time.now.to_i < start_at.to_i

    next if is_not_released_to_student

    json.workflowState 'unstarted'
  end

  json.dueIn time_until_due(Time.now, end_at)

  json.id assessment.id
  json.title assessment.title

  json.tab do
    json.id assessment.tab_id
    json.title assessment.tab.title
  end

  json.category do
    json.id assessment.tab.category_id
    json.title assessment.tab.category.title
  end

  json.maximumGrade @maximum_grade_hash[assessment.id]

  json.isPersonalizedTimeline @personal_timeline[[assessment.id, student_id]].present?
  json.endAt end_at
  json.referenceEndAt reference_end_at
  json.isTimelineFixed is_fixed || false
end
