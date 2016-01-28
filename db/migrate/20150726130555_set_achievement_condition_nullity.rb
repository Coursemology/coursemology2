# frozen_string_literal: true
class SetAchievementConditionNullity < ActiveRecord::Migration
  def change
    change_column_null :course_condition_achievements, :achievement_id, false
  end
end
