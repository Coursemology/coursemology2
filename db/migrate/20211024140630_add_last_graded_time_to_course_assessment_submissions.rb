class AddLastGradedTimeToCourseAssessmentSubmissions < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_submissions, :last_graded_time, :datetime, default: Time.now
  end
end
