# frozen_string_literal: true
survey_condition = condition
json.type t('course.condition.survey.title')
json.description format_inline_text(survey_condition.title)
json.edit_url url_for([:edit, course, conditional, survey_condition])
json.delete_url url_for([course, conditional, survey_condition])
