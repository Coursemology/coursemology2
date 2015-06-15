class CreateCourseEvents < ActiveRecord::Migration
  def change
    create_table :course_events do |t|
      t.string :location
      t.integer :event_type, default: 0
    end
  end
end
