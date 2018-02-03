class CreateCourseDiscussionPostVotes < ActiveRecord::Migration[4.2]
  def change
    create_table :course_discussion_post_votes do |t|
      t.references :post, null: false, foreign_key: { references: :course_discussion_posts }
      t.boolean :vote_flag, null: false
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    add_index :course_discussion_post_votes, [:post_id, :creator_id], unique: true
  end
end
