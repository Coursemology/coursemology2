# frozen_string_literal: true
class CreateCourseUserAchievements < ActiveRecord::Migration[4.2]
  def change
    create_table :course_user_achievements do |t|
      t.references :course_user
      t.references :achievement, foreign_key: { references: :course_achievements }
      t.datetime :obtained_at, null: false

      t.index [:course_user_id, :achievement_id],
              unique: true, name: :index_user_achievements_on_course_user_id_and_achievement_id
      t.timestamps null: false
    end
  end
end
