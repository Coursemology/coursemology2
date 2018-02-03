class ChangeCourseGroupsFromUserToCourseUser < ActiveRecord::Migration[4.2]
  def change
    remove_index :course_group_users,
                 column: [:user_id, :course_group_id],
                 name: 'index_course_group_users_on_user_id_and_course_group_id'
    remove_column :course_group_users, :user_id, :integer,
                  null: false, foreign_key: { references: :users }
    rename_column :course_group_users, :course_group_id, :group_id

    add_column :course_group_users, :course_user_id, :integer,
               null: false, foreign_key: { references: :course_users }
    add_index :course_group_users, [:course_user_id, :group_id],
              unique: true, name: 'index_course_group_users_on_course_user_id_and_course_group_id'
  end
end
