class CreateCourseMaterialTextChunkReferences < ActiveRecord::Migration[7.2]
  def change
    create_table :course_material_text_chunk_references, id: :uuid, default: -> { "uuid_generate_v4()" } do |t|
      t.datetime :created_at, precision: nil, null: false
      t.datetime :updated_at, precision: nil, null: false
      t.references :material, 
                    null: false, 
                    foreign_key: { to_table: :course_materials, name: "fk_course_material_text_chunk_references_material_id" }, 
                    index: { name: "fk__course_material_text_chunk_references_material_id" }
      t.references :text_chunk, 
                    null: false, 
                    foreign_key: { to_table: :course_material_text_chunks, name: "fk_course_material_text_chunk_references_text_chunk_id" }, 
                    index: { name: "fk__course_material_text_chunk_references_text_chunk_id" }
      t.references :creator, 
                    null: false,
                    foreign_key: { to_table: :users, name: "fk_course_material_text_chunk_references_creator_id" },
                    index: { name: "fk__course_material_text_chunk_references_creator_id" }
      t.references :updater, 
                    null: false,
                    foreign_key: { to_table: :users, name: "fk_course_material_text_chunk_references_updater_id" },
                    index: { name: "fk__course_material_text_chunk_references_updater_id" }
    end
  end
end
