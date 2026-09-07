# frozen_string_literal: true
categories = current_course.assessment_categories.includes(:tabs)

json.showPublicTestCasesOutput current_course.show_public_test_cases_output || false
json.showStdoutAndStderr current_course.show_stdout_and_stderr || false
json.allowRandomization current_course.allow_randomization || false
json.allowMrqOptionsRandomization current_course.allow_mrq_options_randomization || false
json.maxProgrammingTimeLimit current_course.programming_max_time_limit if can?(:manage, :all)
json.rubricGradingPromptEnabled current_course.rubric_grading_prompt_enabled
json.rubricGradingPrompt current_course.rubric_grading_prompt || ''

# Admin-only model configuration: the flag drives whether the fields render at all, and the values are only
# sent to those who may change them (the controller likewise refuses to permit the params otherwise).
can_manage_ai_grading_settings = can?(:manage, :ai_grading_settings)
json.canManageAiGradingSettings can_manage_ai_grading_settings
if can_manage_ai_grading_settings
  json.availableGradingModels Course::Rubric::LlmService::LlmAdapter.available_models
  # Resolved here rather than left blank for the picker to interpret: an unconfigured course grades on the
  # default model, so that is what the picker should show as selected.
  json.rubricGradingModel current_course.rubric_grading_model.presence ||
                          Course::Rubric::LlmService::LlmAdapter::DEFAULT_MODEL
  json.rubricGradingModelOptionsEnabled current_course.rubric_grading_model_options_enabled
  json.rubricGradingModelOptions current_course.rubric_grading_model_options || ''
  json.rubricGradingSystemPromptEnabled current_course.rubric_grading_system_prompt_enabled
  json.rubricGradingSystemPrompt current_course.rubric_grading_system_prompt || ''
  # An override replaces this template and is interpolated with the same placeholders, which are the only
  # route the question, rubric and context take to the model -- so both are shown to whoever writes one.
  json.defaultGradingSystemPrompt Course::Rubric::LlmService.system_prompt.template
  json.gradingSystemPromptVariables Course::Rubric::LlmService.system_prompt_variables
end

json.canCreateCategories can?(:create, Course::Assessment::Category.new(course: current_course))

tabs = categories.includes(:tabs).flat_map(&:tabs)
tabs_assessments_count_hash = Course::Assessment.where(tab: tabs).group(:tab_id).count

json.categories categories do |category|
  json.id category.id
  json.title category.title
  json.weight category.weight

  json.canDeleteCategory can?(:destroy, category)
  json.canCreateTabs can?(:create, Course::Assessment::Tab.new(category: category))

  category_assessment_count = 0
  category_top_assessment_titles = nil

  json.tabs category.tabs.calculated(:top_assessment_titles) do |tab|
    json.id tab.id
    json.title tab.title
    json.weight tab.weight
    json.categoryId category.id

    json.canDeleteTab can?(:destroy, tab)

    tab_assessment_count = tabs_assessments_count_hash[tab.id] || 0
    tab_top_assessment_titles = tab.top_assessment_titles || []
    json.assessmentsCount tab_assessment_count
    json.topAssessmentTitles tab_top_assessment_titles

    category_assessment_count += tab_assessment_count
    category_top_assessment_titles ||= tab_top_assessment_titles
  end

  json.assessmentsCount category_assessment_count
  json.topAssessmentTitles category_top_assessment_titles || []
end
