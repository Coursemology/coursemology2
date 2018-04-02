# frozen_string_literal: true
assessment_condition = condition
json.type t('course.condition.assessment.title')
json.description format_inline_text(assessment_condition.title)
json.edit_url url_for([:edit, course, conditional, assessment_condition])
json.delete_url url_for([course, conditional, assessment_condition])
