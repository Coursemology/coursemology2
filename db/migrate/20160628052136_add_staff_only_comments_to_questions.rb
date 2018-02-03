class AddStaffOnlyCommentsToQuestions < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_questions, :staff_only_comments, :text
  end
end
