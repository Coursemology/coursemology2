class CreateCourseMaterialTextChunks < ActiveRecord::Migration[7.2]
  def change
    # Ensure pgvector extension is enabled
    enable_extension "vector" unless extension_enabled?("vector")

    create_table :course_material_text_chunks, id: :serial, force: :cascade do |t|

      # Main association
      t.text :content, null: false
      t.vector :embedding, limit: 1536, null: false
      t.datetime :created_at, precision: nil, null: false

      # Foreign Keys
      t.references :creator, 
                    null: false,
                    foreign_key: { to_table: :users, name: "fk_course_material_text_chunks_creator_id" },
                    index: { name: "fk__course_material_text_chunks_creator_id" }
      t.references :course,
                    null: false,
                    foreign_key: { to_table: :courses, name: "fk_course_material_text_chunks_course_id" },
                    index: { name: "fk__course_material_text_chunks_course_id" }
      t.references :course_material, 
                    null: false, 
                    foreign_key: { to_table: :course_materials, name: "fk_course_material_text_chunks_material_id" }, 
                    index: { name: "fk__course_material_text_chunks_material_id" }

      # Indexes
      t.index :embedding, 
              name: "index_course_material_text_chunk_embedding", 
              opclass: :vector_cosine_ops, 
              using: :hnsw

      t.index [:course_material_id, :content],
              unique: true, 
              name: 'index_text_chunks_on_text_chunk_id_and_content'
    end
  end
end
