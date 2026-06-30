# frozen_string_literal: true

json.partial! 'course/rubrics/answer_evaluation',
              collection: @answer_evaluations + @grading_evaluations, as: :answer_evaluation
