# frozen_string_literal: true
class LinkCourseAssessmentAnswerAutoGradingToJobs < ActiveRecord::Migration[4.2]
  def change
    remove_column :course_assessment_answer_auto_gradings, :status, :integer,
                  null: false, default: 0
    change_table :course_assessment_answer_auto_gradings do |t|
      t.uuid :job_id, foreign_key: { references: :jobs, on_delete: :set_null }, index: :unique
    end
  end
end
