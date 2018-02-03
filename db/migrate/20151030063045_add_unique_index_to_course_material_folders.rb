# frozen_string_literal: true
class AddUniqueIndexToCourseMaterialFolders < ActiveRecord::Migration[4.2]
  def change
    add_index :course_material_folders, [:owner_id, :owner_type], unique: true
  end
end
