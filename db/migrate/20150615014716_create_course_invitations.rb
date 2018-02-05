# frozen_string_literal: true
class CreateCourseInvitations < ActiveRecord::Migration[4.2]
  def change
    create_table :course_user_invitations do |t|
      t.references :course_user, null: false, index: :unique
      t.references :user_email, null: false
      t.string :invitation_key, null: false, limit: 16, index: :unique

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    change_column_null :user_emails, :user_id, true
    change_column_null :course_users, :user_id, true
  end
end
