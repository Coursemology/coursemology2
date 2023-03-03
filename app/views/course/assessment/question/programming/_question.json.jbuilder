# frozen_string_literal: true
json.question do
  json.(@programming_question, :id, :title, :staff_only_comments, :maximum_grade,
        :language_id, :memory_limit, :time_limit)
  json.max_time_limit @programming_question.max_time_limit
  json.description format_ckeditor_rich_text(@programming_question.description)
  json.languages Coursemology::Polyglot::Language.all.order(:name) do |lang|
    json.(lang, :id, :name)
    json.editor_mode lang.ace_mode
  end
  json.skill_ids @question_assessment.skills.order_by_title.as_json(only: [:id, :title])
  json.skills current_course.assessment_skills.order_by_title do |skill|
    json.(skill, :id, :title)
  end

  has_submissions = @programming_question.answers.without_attempting_state.count > 0
  json.autograded @programming_question.persisted? ? @programming_question.attachment.present? : @assessment.autograded?
  json.has_auto_gradings @programming_question.auto_gradable? && has_submissions
  json.has_submissions has_submissions
  json.display_autograded_toggle display_autograded_toggle?
  json.course_gamified current_course.gamified?
  json.autograded_assessment @assessment.autograded?
  json.published_assessment @assessment.published?
  json.attempt_limit @programming_question.attempt_limit
  json.is_codaveri @programming_question.is_codaveri
  json.codaveri_enabled current_course.component_enabled?(Course::CodaveriComponent)
  json.codaveri_is_solution_required current_course.settings(:course_codaveri_component).is_solution_required
  json.existing_submissions_count @assessment.submissions.count

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
