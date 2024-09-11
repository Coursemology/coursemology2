class AddTimerStartAtForSubmission < ActiveRecord::Migration[7.0]
  def change
    add_column :course_assessment_submissions, :timer_started_at, :datetime
  end
end
