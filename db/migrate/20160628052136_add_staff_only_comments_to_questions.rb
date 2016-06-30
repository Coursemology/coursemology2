class AddStaffOnlyCommentsToQuestions < ActiveRecord::Migration
  def change
    add_column :course_assessment_questions, :staff_only_comments, :text
  end
end
