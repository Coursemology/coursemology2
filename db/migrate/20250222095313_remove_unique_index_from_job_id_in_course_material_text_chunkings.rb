class RemoveUniqueIndexFromJobIdInCourseMaterialTextChunkings < ActiveRecord::Migration[7.2]
  def change
     # Remove the existing unique index
     remove_index :course_material_text_chunkings, column: :job_id, name: "fk__course_material_text_chunkings_job_id"

     # Add a new index without uniqueness constraint
     add_index :course_material_text_chunkings, :job_id, name: "fk__course_material_text_chunkings_job_id"
  end
end
