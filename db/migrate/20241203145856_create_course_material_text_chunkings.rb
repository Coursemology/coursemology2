class CreateCourseMaterialTextChunkings < ActiveRecord::Migration[7.2]
  def change
    create_table :course_material_text_chunkings, id: :serial do |t|
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
      # Foreign Keys
      t.references :material, null: false, foreign_key: { to_table: :course_materials, name: "fk_course_material_text_chunkings_material_id" }, index: { name: "fk__course_material_text_chunkings_material_id", unique: true }
      t.references :job, type: :uuid, foreign_key: { to_table: :jobs, name: "fk_course_material_text_chunkings_job_id", on_delete: :nullify }, index: { name: "fk__course_material_text_chunkings_job_id", unique: true }
    end
  end
end
