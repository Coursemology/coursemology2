# frozen_string_literal: true
class CreateNewCodaveriFeedbacksTable < ActiveRecord::Migration[6.0]
  def change
    create_table :course_discussion_post_codaveri_feedbacks do |t|
      t.references :post, null: false, foreign_key: { to_table: :course_discussion_posts },
                          index: { name: 'fk__codaveri_feedback_discussion_post_id', unique: true }
      t.integer :status, index: true, default: nil
      t.text :codaveri_feedback_id, null: false
      t.text :original_feedback, null: false
      t.integer :rating
      t.timestamps null: false
    end

    add_column :course_assessment_answer_programming, :codaveri_feedback_job_id, :uuid,
               index: :unique, comment: 'The ID of the codaveri code feedback job'
    add_foreign_key :course_assessment_answer_programming, :jobs, column: :codaveri_feedback_job_id, on_delete: :nullify
  end
end
