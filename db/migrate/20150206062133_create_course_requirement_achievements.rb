class CreateCourseRequirementAchievements < ActiveRecord::Migration
  def change
    create_table :course_requirement_achievements do |t|
      t.belongs_to :course_achievement, index: true
      t.timestamps
    end
  end
end
