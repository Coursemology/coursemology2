class CreateCourseExpRecords < ActiveRecord::Migration
  def change
    create_table :course_exp_records do |t|
      t.integer :exp_awarded,     null: false
      t.integer :course_user_id,  null: false
      t.string :reason

      t.actable
      t.userstamps null: false, foreign_key: { references: :users }

      t.timestamps null: false
    end
  end
end
