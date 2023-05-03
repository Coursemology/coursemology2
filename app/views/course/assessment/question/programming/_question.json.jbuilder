# frozen_string_literal: true
json.question do
  json.partial! 'course/assessment/question/form',
                question: @programming_question,
                question_assessment: @question_assessment

  json.skillIds @question_assessment.skills.order_by_title.as_json(only: [:id, :title])

  json.languageId @programming_question.language_id || ''
  json.memoryLimit @programming_question.memory_limit || ''
  json.timeLimit @programming_question.time_limit || ''
  json.maxTimeLimit @programming_question.max_time_limit || ''
  json.attemptLimit @programming_question.attempt_limit || ''
  json.isLowPriority @programming_question.is_low_priority
  json.autograded @programming_question.persisted? ? @programming_question.attachment.present? : @assessment.autograded?
  json.editOnline can_edit_online?

  has_submissions = @programming_question.answers.without_attempting_state.count > 0
  json.hasAutoGradings @programming_question.auto_gradable? && has_submissions
  json.hasSubmissions has_submissions

  json.isCodaveri @programming_question.is_codaveri
  json.codaveriEnabled current_course.component_enabled?(Course::CodaveriComponent)

  if @programming_question.attachment.present? && @programming_question.attachment.persisted?
    json.package do
      package = @programming_question.attachment
      json.name package.name
      json.path attachment_reference_path(package)
      json.updaterName package.updater.name
      json.updatedAt package.updated_at
    end
  end

  json.canSwitchPackageType can_switch_package_type?
end
