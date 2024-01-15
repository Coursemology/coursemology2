# frozen_string_literal: true
# This partial is required to DRY up the code because the abstract question model
# directly renders the actable partial by delegating :to_partial_path to the actable.

json.id question.id
json.description format_ckeditor_rich_text(question.description)
json.maximumGrade question.maximum_grade.to_f

json.canViewHistory question.history_viewable?
json.type question.question_type

json.partial! question, question: question.specific, can_grade: can_grade, answer: answer
