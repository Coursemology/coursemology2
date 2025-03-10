class CreateCourseForumImportsAndDiscussions < ActiveRecord::Migration[7.2]
  def change
    create_table :course_forum_imports do |t|
      t.datetime :created_at, precision: nil, null: false
      t.datetime :updated_at, precision: nil, null: false
      t.references :course, null: false, foreign_key: { to_table: :courses, name: "fk_ccourse_forum_imports_course_id" }, index: { name: "fk__course_forum_imports_course_id" }
      t.references :imported_forum, null: false, foreign_key: { to_table: :course_forums, name: "fk_course_forum_imports_imported_forum_id" }, index: { name: "fk__course_forum_imports_imported_forum_id" }
      t.string :workflow_state, limit: 255, null: false, default: "not_imported"
      t.references :job, type: :uuid, foreign_key: { to_table: :jobs, name: "fk_course_forum_importings_job_id", on_delete: :nullify }, index: { name: "fk__course_forum_importings_job_id" }
    end

    create_table :course_forum_discussions do |t|
      t.vector :embedding, limit: 1536, null: false
      t.jsonb :discussion, null:false, default: {}
      t.string :name, null: false
      # Indexes
      t.index :embedding, 
              name: "index_course_forum_discussions_on_embedding", 
              opclass: :vector_cosine_ops, 
              using: :hnsw
      t.index :name, name: "index_course_forum_discussions_on_name"
    end

    create_table :course_forum_discussion_references do |t|
      t.datetime :created_at, precision: nil, null: false
      t.datetime :updated_at, precision: nil, null: false
      t.references :forum_import, 
                    null: false, 
                    foreign_key: { to_table: :course_forum_imports, name: "fk_course_forum_discussion_references_forum_import_id" }, 
                    index: { name: "fk__course_forum_discussion_references_forum_import_id" }
      t.references :discussion, 
                    null: false, 
                    foreign_key: { to_table: :course_forum_discussions, name: "fk_course_forum_discussion_references_discussion_id" }, 
                    index: { name: "fk__course_forum_discussion_references_discussion_id" }
      t.references :creator, 
                    null: false,
                    foreign_key: { to_table: :users, name: "fk_course_forum_discussion_references_creator_id" },
                    index: { name: "fk__course_forum_discussion_references_creator_id" }
      t.references :updater, 
                    null: false,
                    foreign_key: { to_table: :users, name: "fk_course_forum_discussion_references_updater_id" },
                    index: { name: "fk__course_forum_discussion_references_updater_id" }
    end
  end
end
