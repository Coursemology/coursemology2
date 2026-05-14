class AddExternalIdToCourseUsersAndInvitations < ActiveRecord::Migration[7.2]
  def change
    add_column :course_users, :external_id, :string
    add_column :course_user_invitations, :external_id, :string

    add_index :course_users, [:course_id, :external_id],
              unique: true,
              where: 'external_id IS NOT NULL',
              name: 'index_course_users_on_course_id_and_external_id'

    add_index :course_user_invitations, [:course_id, :external_id],
              unique: true,
              where: 'external_id IS NOT NULL AND confirmed_at IS NULL',
              name: 'index_course_user_invitations_on_course_id_and_external_id'
  end
end
