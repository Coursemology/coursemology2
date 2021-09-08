class BlockStudentViewingSubmission < ActiveRecord::Migration[5.2]
  def change
    add_column :course_assessments, :block_student_viewing_after_submitted, :boolean, default: false
  end
end
