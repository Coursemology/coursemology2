class AddAutogradedToCourseAssessments < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessments, :autograded, :boolean, null: false
  end
end
