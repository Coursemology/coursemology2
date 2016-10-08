class RenameAssessmentsDisplayMode < ActiveRecord::Migration
  def change
    change_table :course_assessments do |t|
      t.rename :display_mode, :mode
    end
  end
end
