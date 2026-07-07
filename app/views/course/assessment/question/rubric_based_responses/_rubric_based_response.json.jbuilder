# frozen_string_literal: true
json.aiGradingEnabled question.ai_grading_enabled? if can_grade

json.autogradable false
json.templateText question.template_text

json.partial! 'course/assessment/question/rubric_categories',
              question: question, answer: answer, can_grade: can_grade
