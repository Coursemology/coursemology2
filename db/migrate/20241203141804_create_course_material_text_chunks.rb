class CreateCourseMaterialTextChunks < ActiveRecord::Migration[7.2]
  def change
    # Ensure pgvector extension is enabled
    enable_extension "vector" unless extension_enabled?("vector")

    create_table :course_material_text_chunks, id: :serial, force: :cascade do |t|
      # Main association
      t.text :content, null: false
      t.vector :embedding, limit: 1536, null: false
      t.string :name, limit: 255, null: false

      # Indexes
      t.index :embedding, 
              name: "index_course_material_text_chunk_embedding", 
              opclass: :vector_cosine_ops, 
              using: :hnsw
      t.index :name, name: 'index_course_material_text_chunks_on_name'
    end

    create_table :course_material_text_chunkings, id: :serial do |t|
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
      # Foreign Keys
      t.references :material, null: false, foreign_key: { to_table: :course_materials, name: "fk_course_material_text_chunkings_material_id" }, index: { name: "fk__course_material_text_chunkings_material_id", unique: true }
      t.references :job, type: :uuid, foreign_key: { to_table: :jobs, name: "fk_course_material_text_chunkings_job_id", on_delete: :nullify }, index: { name: "fk__course_material_text_chunkings_job_id", unique: true }
    end
    
    change_table :course_materials do |t|
      t.string :workflow_state, limit: 255, null: false, default: "not_chunked"
    end

    add_index :course_materials, :workflow_state

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
