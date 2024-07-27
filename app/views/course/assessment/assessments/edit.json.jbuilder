# frozen_string_literal: true
json.attributes do
  json.call(@assessment, :id, :title, :description, :base_exp,
            :time_bonus_exp, :published, :autograded, :show_mcq_mrq_solution, :show_private, :show_evaluation,
            :skippable, :tabbed_view, :view_password, :session_password, :delayed_grade_publication, :tab_id,
            :use_public, :use_private, :use_evaluation, :allow_partial_submission, :has_personal_times,
            :affects_personal_times, :show_mcq_answer, :block_student_viewing_after_submitted, :has_todo,
            :allow_record_draft_answer, :time_limit, :live_feedback_enabled)

  json.course_live_feedback_enabled @assessment.course.codaveri_live_feedback_enabled?

  # TODO: [PR#5491] Edit Assessment only changes time in the Default Timeline
  json.start_at @assessment.start_at&.iso8601
  json.end_at @assessment.end_at&.iso8601
  json.bonus_end_at @assessment.bonus_end_at&.iso8601

  # Randomized Assessment is temporarily hidden (PR#5406)
  # Pass as boolean since there is only one enum value
  # json.randomization @assessment.randomization.present?

  json.partial! 'monitoring_details' if @monitor.present?
end

json.tab_attributes do
  json.tab_title @tab.title
  json.category_title @category.title
  json.only_tab @category.tabs.count == 1
end

json.mode_switching @assessment.allow_mode_switching?
json.gamified current_course.gamified?
json.show_personalized_timeline_features current_course.show_personalized_timeline_features?
json.randomization_allowed current_course.allow_randomization

json.monitoring_component_enabled @monitoring_component_enabled
json.can_manage_monitor @can_manage_monitor && @monitoring_component_enabled
json.monitoring_url monitoring_course_assessment_path(current_course, @assessment)

json.folder_attributes do
  json.folder_id @assessment.folder.id
  json.enable_materials_action !current_component_host[:course_materials_component].nil?
  json.materials @assessment.materials.order(:name) do |material|
    json.partial! '/course/material/material', material: material, folder: @assessment.folder
  end
end

json.partial! 'course/condition/condition_data', conditional: @assessment
