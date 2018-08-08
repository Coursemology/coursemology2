# frozen_string_literal: true

json.languages Coursemology::Polyglot::Language.all.order(:name) do |lang|
  json.(lang, :id, :name)
  json.editor_mode lang.ace_mode
end
json.skills current_course.assessment_skills.order('LOWER(title) ASC').as_json(only: [:id, :title])

json.formValues do
  json.question_programming do
    json.(@programming_question, :title, :description, :staff_only_comments, :maximum_grade,
                                 :language_id, :memory_limit, :time_limit, :attempt_limit)
    json.skill_ids @question_assessment.skills.order('LOWER(title) ASC').pluck(:id)
    json.autograded @programming_question.persisted? ?
      @programming_question.attachment.present? : @assessment.autograded?
  end
end

has_submissions = @programming_question.answers.without_attempting_state.count > 0
json.hasAutoGradings @programming_question.auto_gradable? && has_submissions
json.hasSubmissions has_submissions
json.displayAutogradedToggle display_autograded_toggle?
json.autogradedAssessment @assessment.autograded?
json.publishedAssessment @assessment.published?
json.canSwitchPackageType can_switch_package_type?
json.canEditOnline can_edit_online?

if @programming_question.attachment.present? && @programming_question.attachment.persisted?
  json.packageFile do
    json.name @programming_question.attachment.name
    json.path attachment_reference_path(@programming_question.attachment)
    json.updater_name @programming_question.attachment.updater.name
  end
else
  json.packageFile nil
end
