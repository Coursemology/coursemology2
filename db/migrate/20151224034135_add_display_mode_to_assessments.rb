class AddDisplayModeToAssessments < ActiveRecord::Migration
  def change
    change_table :course_assessments do |t|
      t.integer :display_mode, null: false, default: 0
    end
  end
end
