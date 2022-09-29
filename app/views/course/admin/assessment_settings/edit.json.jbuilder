# frozen_string_literal: true
categories = current_course.assessment_categories.includes(:tabs)

json.showPublicTestCasesOutput current_course.show_public_test_cases_output
json.showStdoutAndStderr current_course.show_stdout_and_stderr
json.allowRandomization current_course.allow_randomization
json.allowMrqOptionsRandomization current_course.allow_mrq_options_randomization

categories_assessments_hash = Course::Assessment::Category.includes(:assessments).to_h do |category|
  [category.id, category.assessments]
end

tabs_assessments_hash = Course::Assessment::Tab.includes(:assessments).to_h do |tab|
  [tab.id, tab.assessments]
end

json.categories do
  json.array! categories do |category|
    json.id category.id
    json.title category.title
    json.weight category.weight

    category_assessments = categories_assessments_hash[category.id]
    json.assessmentsIds category_assessments.map(&:id)
    json.assessmentsCount category_assessments.count
    json.topAssessmentsTitles category_assessments.first(3).map(&:title)

    json.tabs do
      json.array! category.tabs do |tab|
        json.id tab.id
        json.title tab.title
        json.weight tab.weight
        json.categoryId category.id

        tab_assessments = tabs_assessments_hash[tab.id]
        json.assessmentsIds tab_assessments.map(&:id)
        json.assessmentsCount tab_assessments.count
        json.topAssessmentsTitles tab_assessments.first(3).map(&:title)
      end
    end
  end
end
