# frozen_string_literal: true
class CreateCourseAssessmentQuestionForumPostResponses < ActiveRecord::Migration[6.0]
  def change
    create_table :course_assessment_question_forum_post_responses do |t|
      t.boolean :has_text_response, null: false
      t.integer :max_posts, limit: 2, null: false
    end

    create_table:course_assessment_answer_forum_post_responses do |t|
      t.string :answer_text, null: true
    end

    create_table:course_assessment_answer_forum_posts do |t|
      t.references :answer,
                   null: false,
                   foreign_key: {
                     to_table: :course_assessment_answer_forum_post_responses
                   }
      t.references :forum_topic,
                   null: false,
                   foreign_key: {
                     to_table: :course_forum_topics
                   }
      t.references :post,
                   null: false,
                   foreign_key: {
                     to_table: :course_discussion_posts
                   }
      t.string :post_text, null: false
      t.boolean :is_post_updated, null: false
      t.boolean :is_post_deleted, null: false
      t.references :parent_post,
                   null: false,
                   foreign_key: {
                     to_table: :course_discussion_posts
                   }
      t.string :parent_post_text, null: false
      t.boolean :is_parent_post_updated, null: false
      t.boolean :is_parent_post_deleted, null: false
    end
  end
end
