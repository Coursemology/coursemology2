# frozen_string_literal: true
json.id @question_assessment.id
json.number @question_assessment.question_number
json.defaultTitle @question_assessment.default_title(@question_assessment.question_number)
json.title @question.title
json.editUrl url_for([:edit, current_course, @assessment, @question.specific]) if can?(:manage, @assessment)
