class AddTimestampsToCourseAssessmentAnswers < ActiveRecord::Migration
  def change
    change_table :course_assessment_answers do |t|
      t.timestamps null: false
    end
  end
end
