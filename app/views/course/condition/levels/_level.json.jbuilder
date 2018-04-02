# frozen_string_literal: true
level_condition = condition
json.type t('course.condition.level.title')
json.description format_inline_text(level_condition.title)
json.edit_url url_for([:edit, course, conditional, level_condition])
json.delete_url url_for([course, conditional, level_condition])
