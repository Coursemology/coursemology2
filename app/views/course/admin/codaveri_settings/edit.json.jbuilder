# frozen_string_literal: true
json.feedbackWorkflow @settings.feedback_workflow
json.isOnlyITSP @settings.is_only_itsp

json.assessmentCategories current_course.assessment_categories do |cat|
  json.id cat.id
  json.url course_assessments_path(current_course, category: cat.id)
  json.title cat.title
  json.weight cat.weight
end

json.assessmentTabs current_course.assessment_tabs do |tab|
  json.id tab.id
  json.url course_assessments_path(current_course, category: tab.category_id, tab: tab.id)
  json.categoryId tab.category_id
  json.title tab.title
end

json.assessments @assessments_with_programming_qns do |assessment|
  json.id assessment.id
  json.tabId assessment.tab_id
  json.categoryId assessment.tab.category_id
  json.title assessment.title
  json.url course_assessment_path(current_course, assessment)

  json.programmingQuestions assessment.programming_questions do |programming_qn|
    next unless programming_qn.language.codaveri_evaluator_whitelisted?

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
end
