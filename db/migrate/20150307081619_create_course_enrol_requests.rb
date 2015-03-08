class CreateCourseEnrolRequests < ActiveRecord::Migration
  def change
    create_table :course_enrol_requests do |t|
      t.belongs_to :user
      t.belongs_to :course
      t.integer :role

      t.datetime :deleted_at
      t.index :deleted_at
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps
    end
  end
end
