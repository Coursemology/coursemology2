class AddAnswerToPosts < ActiveRecord::Migration
  def change
    add_column :course_discussion_posts, :answer, :boolean, default: false
  end
end
