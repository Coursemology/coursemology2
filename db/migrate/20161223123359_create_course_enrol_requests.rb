class CreateCourseEnrolRequests < ActiveRecord::Migration[4.2]
  def change
    create_table :course_enrol_requests do |t|
      t.references :course, null: false
      t.references :user, null: false

      t.timestamps

      t.index [:course_id, :user_id], unique: true
    end
  end
end
