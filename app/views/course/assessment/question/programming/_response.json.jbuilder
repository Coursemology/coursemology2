# frozen_string_literal: true
if check_import_job?
  json.import_job_url job_path(@programming_question.import_job)

  if response[:redirect_to_edit]
    json.redirect_edit do
      json.url edit_course_assessment_question_programming_path(current_course, @assessment, @programming_question)
      json.page_header @question_assessment.display_title
      json.page_title @question_assessment.display_title + ' - ' + page_title
    end
  end
end

json.redirect_assessment course_assessment_path(current_course, @assessment)
json.message response[:message]
