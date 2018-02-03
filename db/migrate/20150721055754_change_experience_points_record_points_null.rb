# frozen_string_literal: true
class ChangeExperiencePointsRecordPointsNull < ActiveRecord::Migration[4.2]
  def change
    change_column_null :course_experience_points_records, :points_awarded, true
  end
end
