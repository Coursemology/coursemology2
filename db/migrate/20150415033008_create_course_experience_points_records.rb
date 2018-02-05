# frozen_string_literal: true
class CreateCourseExperiencePointsRecords < ActiveRecord::Migration[4.2]
  def change
    create_table :course_experience_points_records do |t|
      t.actable index: { unique: true, name: :index_course_experience_points_records_on_actable }

      t.integer :points_awarded,     null: false
      t.references :course_user,     null: false
      t.string :reason

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
