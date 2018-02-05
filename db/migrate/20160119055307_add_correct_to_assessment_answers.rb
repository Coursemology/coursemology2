# frozen_string_literal: true
class AddCorrectToAssessmentAnswers < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_answers, :correct, :boolean,
               comment: 'Correctness is independent of the grade (depends on the grading schema)'
  end
end
