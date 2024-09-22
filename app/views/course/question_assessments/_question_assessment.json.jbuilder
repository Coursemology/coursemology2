# frozen_string_literal: true
assessment = question_assessment.assessment
question = question_assessment.question
question_duplication_dropdown_data = @question_duplication_dropdown_data

json.id question_assessment.id
question_number = question_assessment.question_number
json.number question_number
json.defaultTitle question_assessment.default_title(question_number)
json.title question.title
json.unautogradable !question.auto_gradable? && assessment.autograded?
json.type question_assessment.question.question_type_readable
json.description format_ckeditor_rich_text(question.description) unless question.description.blank?

is_programming_question = question.actable_type == Course::Assessment::Question::Programming.name
is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)

if is_course_koditsu_enabled && is_programming_question
  is_language_supportable_by_koditsu = KoditsuAsyncApiService.language_valid_for_koditsu?(question.actable.language)
  json.isCompatibleWithKoditsu is_programming_question && is_language_supportable_by_koditsu
end

if can?(:manage, assessment)
  json.editUrl url_for([:edit, current_course, assessment, question.specific])
  json.deleteUrl url_for([current_course, assessment, question.specific])

  json.duplicationUrls question_duplication_dropdown_data do |tab_hash|
    json.tab tab_hash[:title]
    json.destinations tab_hash[:assessments] do |assessment_hash|
      json.title assessment_hash[:title]

      id = assessment_hash[:id]
      json.duplicationUrl duplicate_course_assessment_question_path(current_course, assessment, question, id)
      json.isKoditsu assessment_hash[:is_koditsu] && is_course_koditsu_enabled
    end
  end
end

if question.actable.is_a? Course::Assessment::Question::MultipleResponse
  json.partial! 'course/assessment/question/multiple_responses/multiple_response_details', locals: {
    assessment: assessment,
    question: question.specific,
    new_question: false,
    full_options: false
  }
end
