# frozen_string_literal: true
class AddFieldsToCourseMaterialFolders < ActiveRecord::Migration[4.2]
  def change
    remove_column :course_material_folders, :parent_folder_id, :integer,
                  foreign_key: { references: :course_material_folders }

    add_column :course_material_folders, :parent_id, :integer
    add_column :course_material_folders, :course_id, :integer, null: false
    add_column :course_material_folders, :can_student_upload, :boolean, null: false, default: false

    add_index :course_material_folders, [:parent_id, :name], unique: true, case_sensitive: false
  end
end
