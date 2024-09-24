# frozen_string_literal: true
json.assessments [@assessment] do |assessment|
  json.id assessment.id
  json.tabId assessment.tab_id
  json.categoryId assessment.tab.category_id
  json.title assessment.title
  json.url course_assessment_path(current_course, assessment)

  if current_course.component_enabled?(Course::CodaveriComponent)
    json.programmingQuestions @programming_questions do |programming_qn|
      next unless CodaveriAsyncApiService.language_valid_for_codaveri?(programming_qn.language)

      if programming_qn.title.blank?
        question_assessment = assessment.question_assessments.select do |qa|
          qa.question_id == programming_qn.question.id
        end.first
        question_title = question_assessment&.default_title
      else
        question_title = programming_qn.title
      end

      json.id programming_qn.id
      json.editUrl url_for([:edit, current_course, assessment, programming_qn])
      json.assessmentId assessment.id
      json.title question_title
      json.isCodaveri programming_qn.is_codaveri
      json.liveFeedbackEnabled programming_qn.live_feedback_enabled
    end
  else
    json.programmingQuestions []
  end
end
