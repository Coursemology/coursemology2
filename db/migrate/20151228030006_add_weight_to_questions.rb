# frozen_string_literal: true
class AddWeightToQuestions < ActiveRecord::Migration[4.2]
  def change
    change_table :course_assessment_questions do |t|
      t.integer :weight, null: false, default: 0
    end
  end
end
