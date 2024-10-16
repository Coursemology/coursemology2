class AddDeletedAtToCourseUserEmailUnsubscriptions < ActiveRecord::Migration[7.2]
  def change
    add_column :course_user_email_unsubscriptions, :deleted_at, :datetime
    add_index :course_user_email_unsubscriptions, :deleted_at
  end
end
