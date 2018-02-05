# frozen_string_literal: true
class CreateCourseAssessmentProgrammingEvaluations < ActiveRecord::Migration[4.2]
  def change
    create_table :course_assessment_programming_evaluations do |t|
      t.references :course, null: false, foreign_key: { references: :courses }
      t.references :language, null: false, foreign_key: { references: :polyglot_languages }
      t.integer :memory_limit, comment: 'Memory limit, in MiB'
      t.integer :time_limit, comment: 'Time limit, in seconds'
      t.string :status, null: false
      t.references :evaluator, foreign_key: { references: :users }
      t.datetime :assigned_at
      t.text :stdout
      t.text :stderr
      t.text :test_report
      t.timestamps null: false
    end
  end
end
