class CreateRagAutoAnswerings < ActiveRecord::Migration[7.2]
  def change
    create_table :course_forum_rag_auto_answerings do |t|
      t.datetime :created_at, precision: nil, null: false
      t.datetime :updated_at, precision: nil, null: false
      # Foreign Keys
      t.references :post, null: false, foreign_key: { to_table: :course_discussion_posts, name: "fk_course_forum_rag_auto_answerings_post_id" }, index: { name: "fk__course_forum_rag_auto_answerings_post_id", unique: true }
      t.references :job, type: :uuid, foreign_key: { to_table: :jobs, name: "fk_course_forum_rag_auto_answerings_job_id", on_delete: :nullify }, index: { name: "fk__course_forum_rag_auto_answerings_job_id", unique: true }
    end
    add_column :course_discussion_posts, :is_ai_generated, :boolean, default: false, null: false
    add_column :course_discussion_posts, :original_text, :string
    add_column :course_discussion_posts, :faithfulness_score, :float, null: false, default: 0.0
    add_column :course_discussion_posts, :answer_relevance_score, :float, null: false, default: 0.0
  end
end
