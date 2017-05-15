class AddMoreOptionsToCourseAssessments < ActiveRecord::Migration
  def change
    add_column :course_assessments, :show_private, :boolean,
               default: false,
               comment: 'Show private test cases after students answer correctly'
    add_column :course_assessments, :show_evaluation, :boolean,
               default: false,
               comment: 'Show evaluation test cases after students answer correctly'
  end
end
