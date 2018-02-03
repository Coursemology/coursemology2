class AddFieldsToAssessments < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessments, :password, :string
  end
end
