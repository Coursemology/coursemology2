class AddFieldsToAssessments < ActiveRecord::Migration
  def change
    add_column :course_assessments, :password, :string
  end
end
