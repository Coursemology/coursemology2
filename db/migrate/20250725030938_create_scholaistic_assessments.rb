# frozen_string_literal: true
class CreateScholaisticAssessments < ActiveRecord::Migration[7.2]
  def change
    create_table :course_scholaistic_assessments do |t|
      t.string :upstream_id, null: false

      t.timestamps null: false
    end

    create_table :course_condition_scholaistic_assessments do |t|
      t.references :scholaistic_assessment, null: false, foreign_key: { to_table: :course_scholaistic_assessments }
    end

    create_table :course_scholaistic_submissions do |t|
      t.string :upstream_id, null: false
      t.references :assessment, null: false, foreign_key: { to_table: :course_scholaistic_assessments }

      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_scholaistic_submissions_creator_id' }
      t.timestamps null: false

      t.index [:assessment_id, :creator_id], unique: true
    end
  end
end
