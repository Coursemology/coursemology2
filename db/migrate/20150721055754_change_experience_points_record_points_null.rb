# frozen_string_literal: true
class ChangeExperiencePointsRecordPointsNull < ActiveRecord::Migration
  def change
    change_column_null :course_experience_points_records, :points_awarded, true
  end
end
