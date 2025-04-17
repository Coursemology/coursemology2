# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.isAssessmentAutograded assessment.autograded?

json.partial! 'category_details', question: question
