# frozen_string_literal: true
json.title question.title
json.description format_ckeditor_rich_text(question.description)
json.staffOnlyComments format_ckeditor_rich_text(question.staff_only_comments)
json.maximumGrade question.maximum_grade
json.skillIds question_assessment.skill_ids
