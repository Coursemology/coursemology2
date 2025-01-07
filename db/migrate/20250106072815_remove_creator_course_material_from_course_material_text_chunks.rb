class RemoveCreatorCourseMaterialFromCourseMaterialTextChunks < ActiveRecord::Migration[7.2]
  def change
    remove_columns :course_material_text_chunks, :created_at, :creator_id, :course_material_id, :course_id
  end
end