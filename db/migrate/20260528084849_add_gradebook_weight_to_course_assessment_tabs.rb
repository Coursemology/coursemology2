class AddGradebookWeightToCourseAssessmentTabs < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessment_tabs, :gradebook_weight, :integer, null: false, default: 0
  end
end
