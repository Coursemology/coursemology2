# frozen_string_literal: true
class AddTimeLimitForTimedAssessment < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessments, :time_limit, :integer
  end
end
