# frozen_string_literal: true
json.autogradable question.auto_gradable?
json.hasTextResponse question.has_text_response
json.maxPosts question.max_posts

# Rubric-graded forum questions carry rubric categories so the submission view can render + save the rubric
# panel; empty for default grading (no active rubric).
json.partial! 'course/assessment/question/rubric_categories',
              question: question, answer: answer, can_grade: can_grade
