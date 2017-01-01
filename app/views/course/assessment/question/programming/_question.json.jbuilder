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
  json.skill_ids @programming_question.skills.pluck(:id)
  json.skills current_course.assessment_skills do |skill|
    json.id skill.id
    json.title skill.title
  end
  json.memory_limit @programming_question.memory_limit
  json.time_limit @programming_question.time_limit

  unless @assessment.autograded?
    json.show_attempt_limit true
    json.attempt_limit @programming_question.attempt_limit
  end

  if @programming_question.attachment.present?
    json.package do
      json.name @programming_question.attachment.name
      json.path attachment_reference_path(@programming_question.attachment)
    end
  else
    json.package nil
  end

  json.can_switch_package_type can_switch_package_type?
  json.can_edit_online @programming_question.edit_online?
end
