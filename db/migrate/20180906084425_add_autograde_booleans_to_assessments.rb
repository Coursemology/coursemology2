class AddAutogradeBooleansToAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :course_assessments, :use_public, :boolean, default: true
    add_column :course_assessments, :use_private, :boolean, default: true
    add_column :course_assessments, :use_evaluation, :boolean, default: false
    add_column :course_assessments, :allow_partial_submission, :boolean, default: false
  end
end
