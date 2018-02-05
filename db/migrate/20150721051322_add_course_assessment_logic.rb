# frozen_string_literal: true
class AddCourseAssessmentLogic < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_submissions, :workflow_state, :string, null: false
    remove_column :course_assessment_submissions, :course_user_id, :integer,
                  foreign_key: { references: :course_users }
  end
end
