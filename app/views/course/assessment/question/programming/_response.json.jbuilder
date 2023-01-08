# frozen_string_literal: true
if check_import_job?
  json.import_job_url job_path(@programming_question.import_job)

  json.redirect_edit_url edit_course_assessment_question_programming_path(current_course, @assessment,
                                                                          @programming_question)
end

json.redirect_assessment_url course_assessment_path(current_course, @assessment)
json.message response[:message]
