# frozen_string_literal: true
class CreateScholaisticAssessments < ActiveRecord::Migration[7.2]
  def change
    create_table :course_scholaistic_assessments do |t|
      t.string :upstream_id, null: false, index: { unique: true }

      t.timestamps null: false
    end

    create_table :course_condition_scholaistic_assessments do |t|
      t.references :assessment, null: false, foreign_key: { to_table: :course_scholaistic_assessments }
    end

    create_table :scholaistic_course_users do |t|
      t.string :upstream_id, null: false

      t.references :course_user, null: false, index:true, foreign_key: true
    end
  end
end
