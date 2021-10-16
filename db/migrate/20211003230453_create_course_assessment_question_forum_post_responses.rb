# frozen_string_literal: true
class CreateCourseAssessmentQuestionForumPostResponses < ActiveRecord::Migration[6.0]
  def change
    create_table :course_assessment_question_forum_post_responses do |t|
      t.boolean :has_text_response, null: false
      t.integer :max_posts, limit: 2, null: false
    end

    create_table :course_assessment_answer_forum_post_responses do |t|
      t.string :answer_text, null: true
    end

    create_table :course_assessment_answer_forum_posts do |t|
      t.references :answer,
                   null: false,
                   foreign_key: {
                     to_table: :course_assessment_answer_forum_post_responses
                   }
      t.integer :forum_topic_id, null: false
      t.integer :post_id, null: false
      t.string :post_text, null: false
      t.integer :post_creator_id, null: false
      t.datetime :post_updated_at, null: false
      t.integer :parent_id, null: true
      t.string :parent_text, null: true
      t.integer :parent_creator_id, null: true
      t.datetime :parent_updated_at, null: true
    end
  end
end
