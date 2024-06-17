class AddV2FeedbackJobIdsToProgrammingAssessments < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_answer_programming, :v2_codaveri_submitted_feedback_job_id, :string
    add_column :course_assessment_answer_programming, :v2_codaveri_submitted_feedback_saved, :boolean, default: false, null: false
    add_column :course_assessment_answer_programming, :v2_codaveri_live_feedback_job_id, :string
  end
end
