# frozen_string_literal: true
class CreateCourseEvents < ActiveRecord::Migration[4.2]
  def change
    create_table :course_events do |t|
      t.string :location
      t.integer :event_type, default: 0
    end
  end
end
