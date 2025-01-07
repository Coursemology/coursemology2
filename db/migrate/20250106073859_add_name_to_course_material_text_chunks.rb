class AddNameToCourseMaterialTextChunks < ActiveRecord::Migration[7.2]
  def change
    add_column :course_material_text_chunks, :name, :string, limit: 255, null: false
    add_index :course_material_text_chunks, :name
  end
end
