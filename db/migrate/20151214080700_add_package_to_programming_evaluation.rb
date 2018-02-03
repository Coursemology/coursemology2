# frozen_string_literal: true
class AddPackageToProgrammingEvaluation < ActiveRecord::Migration[4.2]
  def change
    change_table :course_assessment_programming_evaluations do |t|
      t.string :package_path, null: false
    end
  end
end
