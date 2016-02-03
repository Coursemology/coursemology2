# frozen_string_literal: true
class AddUniqueIndexToMaterials < ActiveRecord::Migration
  def change
    add_index :course_materials, [:folder_id, :name], unique: true, case_sensitive: false
  end
end
