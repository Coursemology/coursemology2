# frozen_string_literal: true
json.redirectAssessmentUrl course_assessment_path(current_course, @assessment)

if check_import_job?
  json.importJobUrl job_path(@programming_question.import_job)
end

if redirect_to_edit
  json.id @programming_question.id
  json.redirectEditUrl edit_course_assessment_question_programming_path(
    current_course, @assessment, @programming_question
  )
end
