# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
is_assessment_koditsu_enabled = @assessment.is_koditsu_enabled

languages = Coursemology::Polyglot::Language.all.order(weight: :desc).select do |language|
  (language.enabled || @programming_question.language_id == language.id) &&
    !(is_course_koditsu_enabled && is_assessment_koditsu_enabled && !language.koditsu_whitelisted?)
end
json.languages do
  json.partial! 'languages', locals: { languages: languages }
end

json.partial! 'question'
json.partial! 'package_ui'
json.partial! 'import_result' if @programming_question.import_job

json.partial! 'test_ui' if @meta.present?
