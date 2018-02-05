# frozen_string_literal: true
class AddCourseAssessmentAnswerAutoGrading < ActiveRecord::Migration[4.2]
  def change
    create_table :course_assessment_answer_auto_gradings do |t|
      t.references :answer, foreign_key: { references: :course_assessment_answers }, null: false,
                            index: :unique
      t.integer :status, null: false, default: 0
      t.json :result

      t.timestamps null: false
    end
  end
end
