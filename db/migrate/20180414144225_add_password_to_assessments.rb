class AddPasswordToAssessments < ActiveRecord::Migration[5.1]
  def change
    rename_column :course_assessments, :password, :session_password
    add_column :course_assessments, :view_password, :string, limit: 255
  end
end
