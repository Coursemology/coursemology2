# frozen_string_literal: true
class CreateRubricEvaluationRatingTable < ActiveRecord::Migration[7.2]
  def change
    # Ratings for AI-generated rubric feedback posts (assessment submissions).
    create_table :course_rubric_answer_evaluation_ratings do |t|
      t.references :answer_evaluation, null: false,
                   foreign_key: { to_table: :course_rubric_answer_evaluations, on_delete: :cascade },
                   index: { name: 'fk__craer_answer_evaluation_id' }
      t.references :post, null: true,
                   foreign_key: { to_table: :course_discussion_posts, on_delete: :nullify },
                   index: false
      t.integer :rating
      t.text :original_feedback, null: false
      t.text :edited_feedback

      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__craer_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__craer_updater_id' }
      t.timestamps null: false
    end

    # At most one active rating per AI-generated post; detached (historical) ratings have a null post_id.
    add_index :course_rubric_answer_evaluation_ratings, :post_id, unique: true,
              where: 'post_id IS NOT NULL', name: 'index_craer_on_post_id_unique_active'

    # Ratings for RagWise-generated forum answer posts. Kept separate from rubric feedback ratings so the
    # RAG-specific quality scores can be snapshotted alongside the rating (enabling correlation of user
    # ratings against faithfulness / answer relevance even after the source post is edited or deleted).
    create_table :course_forum_rag_wise_ratings do |t|
      t.references :post, null: true,
                   foreign_key: { to_table: :course_discussion_posts, on_delete: :nullify },
                   index: false
      t.integer :rating
      t.text :original_content, null: false
      t.text :edited_content
      # Snapshot of the response post's evaluation scores at rating time.
      t.float :faithfulness_score, null: false, default: 0.0
      t.float :answer_relevance_score, null: false, default: 0.0

      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__cfrwr_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__cfrwr_updater_id' }
      t.timestamps null: false
    end

    add_index :course_forum_rag_wise_ratings, :post_id, unique: true,
              where: 'post_id IS NOT NULL', name: 'index_cfrwr_on_post_id_unique_active'

    # Renameable mock answers: an author-supplied name so instructors can tell mock answers apart.
    add_column :course_assessment_question_mock_answers, :name, :string, null: false, default: ''
  end
end
