class AddAnswerToPosts < ActiveRecord::Migration[4.2]
  def change
    add_column :course_discussion_posts, :answer, :boolean, default: false
  end
end
