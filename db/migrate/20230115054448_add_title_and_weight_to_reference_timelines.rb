# frozen_string_literal: true
class AddTitleAndWeightToReferenceTimelines < ActiveRecord::Migration[6.0]
  def change
    add_column :course_reference_timelines, :title, :string
    add_column :course_reference_timelines, :weight, :integer

    Course::ReferenceTimeline.where(default: true).update_all(weight: 0)
  end
end
