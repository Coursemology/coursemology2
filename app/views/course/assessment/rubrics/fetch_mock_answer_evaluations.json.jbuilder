# frozen_string_literal: true

json.partial! 'course/rubrics/mock_answer_evaluation',
              collection: @mock_answer_evaluations,
              as: :answer_evaluation
