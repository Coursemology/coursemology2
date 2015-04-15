class CreateCourseLevels < ActiveRecord::Migration
  def change
    create_table :course_levels do |t|
      t.integer :course_id
      t.integer :exp_threshold

      t.timestamps
    end
  end
end
