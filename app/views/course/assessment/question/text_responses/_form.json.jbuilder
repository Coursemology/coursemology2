# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.questionType question.question_type_sym
json.isAssessmentAutograded assessment.autograded?

json.partial! 'solution_details', question: question unless question.file_upload_question?
