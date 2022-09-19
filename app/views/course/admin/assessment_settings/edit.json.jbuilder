# frozen_string_literal: true
categories = current_course.assessment_categories.includes(:tabs)

json.showPublicTestCasesOutput current_course.show_public_test_cases_output
json.showStdoutAndStderr current_course.show_stdout_and_stderr
json.allowRandomization current_course.allow_randomization
json.allowMrqOptionsRandomization current_course.allow_mrq_options_randomization

json.categories do
  json.array! categories do |category|
    json.id category.id
    json.title category.title
    json.weight category.weight

    json.tabs do
      json.array! category.tabs do |tab|
        json.id tab.id
        json.title tab.title
        json.weight tab.weight
        json.categoryId category.id
      end
    end
  end
end
