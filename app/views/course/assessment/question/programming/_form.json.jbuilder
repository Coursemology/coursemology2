# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.languages Coursemology::Polyglot::Language.all.order(weight: :desc).map do |language|
  next unless language.enabled || @programming_question.language_id == language.id

  json.id language.id
  json.name language.name
  json.disabled !language.enabled
  json.editorMode language.ace_mode
end

json.assessmentLiveFeedbackEnabled @assessment.live_feedback_enabled
json.courseLiveFeedbackEnabled current_course.codaveri_live_feedback_enabled?

json.partial! 'question'
json.partial! 'package_ui'

import_job = @programming_question.import_job
json.partial! 'import_result', import_job: import_job if import_job

json.partial! 'test_ui' if @meta.present?
