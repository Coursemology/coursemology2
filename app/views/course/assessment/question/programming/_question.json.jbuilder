json.question do
  json.id @programming_question.id
  json.title @programming_question.title
  json.description @programming_question.description
  json.staff_only_comments @programming_question.staff_only_comments
  json.maximum_grade @programming_question.maximum_grade
  json.weight @programming_question.weight
  json.language_id @programming_question.language_id
  json.languages Coursemology::Polyglot::Language.all do |lang|
    json.id lang.id
    json.name lang.name
    json.editor_mode editor_mode(lang)
  end
  json.skill_ids @programming_question.skills.order('LOWER(title) ASC').as_json(only: [:id, :title])
  json.skills current_course.assessment_skills.order('LOWER(title) ASC') do |skill|
    json.id skill.id
    json.title skill.title
  end
  json.memory_limit @programming_question.memory_limit
  json.time_limit @programming_question.time_limit

  json.autograded_assessment @assessment.autograded?
  json.published_assessment @assessment.published?
  json.attempt_limit @programming_question.attempt_limit

  if @programming_question.attachment.present? && @programming_question.attachment.persisted?
    json.package do
      json.name @programming_question.attachment.name
      json.path attachment_reference_path(@programming_question.attachment)
      json.updater_name @programming_question.attachment.updater.name
    end
  else
    json.package nil
  end

  json.can_switch_package_type can_switch_package_type?
  json.edit_online can_edit_online?
end
