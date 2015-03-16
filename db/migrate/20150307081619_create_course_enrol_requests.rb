class CreateCourseEnrolRequests < ActiveRecord::Migration
  def change
    create_table :course_enrol_requests do |t|
      t.belongs_to :user
      t.belongs_to :course
      t.integer :role
      t.index [:user_id, :course_id], unique: true

      t.datetime :deleted_at
      t.index :deleted_at
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps
    end
  end
end
