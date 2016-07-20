class AddAutogradedToCourseAssessments < ActiveRecord::Migration
  def change
    add_column :course_assessments, :autograded, :boolean, null: false
  end
end
