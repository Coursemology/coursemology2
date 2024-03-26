# frozen_string_literal: true
json.name @all_students.first.name

json.assessments @assessments do |assessment|
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

  student_id = @all_students.first.id
  submission_info = @submissions[[assessment.id, student_id]]
  timeline = @personal_timeline[[assessment.id, student_id]] || @reference_timeline[assessment.id]

  start_at, end_at = timeline
  if submission_info
    submission_id, workflow_state, time_taken, submitted_at, grade = submission_info

    json.grade grade
    json.submissionId submission_id
    json.workflowState workflow_state
    json.timeTaken seconds_to_str(time_taken)
    json.timeOverdue seconds_to_str(time_overdue(submitted_at, end_at))
  else
    json.timeTaken seconds_to_str(nil)

    is_not_released_to_student = Time.now.to_i < start_at.to_i

    if is_not_released_to_student
      json.workflowState 'unreleased'
      json.timeOverdue seconds_to_str(nil)
    else
      json.workflowState 'unstarted'
      json.timeOverdue seconds_to_str(time_overdue(Time.now, end_at))
    end
  end
end
