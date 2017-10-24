# frozen_string_literal: true
class CreateCourseAssessmentAnswerTextInputs < ActiveRecord::Migration
  def change
    create_table :course_assessment_answer_text_inputs do |t|
      t.text :answer_text, null: true
    end
  end
end
