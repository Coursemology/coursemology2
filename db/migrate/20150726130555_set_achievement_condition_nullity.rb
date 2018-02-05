# frozen_string_literal: true
class SetAchievementConditionNullity < ActiveRecord::Migration[4.2]
  def change
    change_column_null :course_condition_achievements, :achievement_id, false
  end
end
