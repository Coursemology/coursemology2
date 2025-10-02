# frozen_string_literal: true
class Course::Assessment::Question::QuestionRubric < ApplicationRecord
  self.table_name = 'course_assessment_question_rubrics'

  belongs_to :rubric, inverse_of: :question_rubrics
  belongs_to :question, class_name: 'Course::Assessment::Question', inverse_of: :question_rubrics
end