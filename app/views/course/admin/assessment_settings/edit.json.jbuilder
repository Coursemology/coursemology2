# frozen_string_literal: true
categories = current_course.assessment_categories.includes(:tabs)

json.showPublicTestCasesOutput current_course.show_public_test_cases_output || false
json.showStdoutAndStderr current_course.show_stdout_and_stderr || false
json.allowRandomization current_course.allow_randomization || false
json.allowMrqOptionsRandomization current_course.allow_mrq_options_randomization || false
json.maxProgrammingTimeLimit current_course.programming_max_time_limit if can?(:manage, :all)

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
