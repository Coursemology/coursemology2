# frozen_string_literal: true
json.partial! 'assessment', assessment: @assessment, course: current_course
json.isAutograded @assessment_autograded
json.questionCount @assessment.question_count
json.questionIds @ordered_questions
json.liveFeedbackEnabled @assessment.programming_questions.any?(&:live_feedback_enabled)
