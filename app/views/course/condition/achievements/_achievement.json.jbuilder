# frozen_string_literal: true
achievement_condition = condition
json.type t('course.condition.achievement.title')
json.description format_inline_text(achievement_condition.title)
json.edit_url url_for([:edit, course, conditional, achievement_condition])
json.delete_url url_for([course, conditional, achievement_condition])
