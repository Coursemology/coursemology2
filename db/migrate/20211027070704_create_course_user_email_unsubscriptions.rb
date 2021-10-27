class CreateCourseUserEmailUnsubscriptions < ActiveRecord::Migration[6.0]
  def change
    create_table :course_user_email_unsubscriptions do |t|
      t.references :course_user, null: false,
                                 foreign_key: { references: :course_users },
                                 index: { name: :index_email_unsubscriptions_on_course_user_id }
      t.references :course_settings_email, null: false,
                                           foreign_key: { references: :course_settings_emails },
                                           index: { name: :index_email_unsubscriptions_on_course_settings_email_id }
    end

    add_index :course_user_email_unsubscriptions, [:course_user_id, :course_settings_email_id],
                          unique: true, name: :index_course_user_email_unsubscriptions_composite
  end
end
