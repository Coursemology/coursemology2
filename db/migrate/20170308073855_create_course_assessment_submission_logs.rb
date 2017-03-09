# frozen_string_literal: true
class CreateCourseAssessmentSubmissionLogs < ActiveRecord::Migration
  def change
    create_table :course_assessment_submission_logs do |t|
      t.references :submission, null: false,
                                foreign_key: { references: :course_assessment_submissions }
      t.jsonb :request
      t.datetime :created_at, null: false
    end
  end
end
