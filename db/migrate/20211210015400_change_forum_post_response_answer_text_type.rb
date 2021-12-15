class ChangeForumPostResponseAnswerTextType < ActiveRecord::Migration[6.0]
  def change
    change_column :course_assessment_answer_forum_post_responses, :answer_text, :text
  end
end
