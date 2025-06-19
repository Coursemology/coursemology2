# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.isAssessmentAutograded assessment.autograded?
json.aiGradingEnabled question.ai_grading_enabled?
json.aiGradingCustomPrompt question.ai_grading_custom_prompt

json.partial! 'category_details', question: question
