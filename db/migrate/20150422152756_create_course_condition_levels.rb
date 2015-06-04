class CreateCourseConditionLevels < ActiveRecord::Migration
  def change
    create_table :course_condition_levels do |t|
      t.integer :minimum_level, null: false
    end
  end
end
