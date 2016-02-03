# frozen_string_literal: true
class CreateCourseConditionsAchievements < ActiveRecord::Migration
  def change
    create_table :course_condition_achievements do |t|
      t.references :achievement, foreign_key: { references: :course_achievements }
    end
  end
end
