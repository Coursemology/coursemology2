# frozen_string_literal: true
json.autogradable question.auto_gradable?

json.options question.ordered_options(current_course, answer&.actable&.get_random_seed) do |option|
  json.option format_html(option.option)
  json.id option.id
  json.correct option.correct if can_grade || (@assessment.show_mcq_mrq_solution && @submission.published?)
end
