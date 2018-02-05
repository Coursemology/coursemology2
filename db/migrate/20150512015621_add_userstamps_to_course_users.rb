# frozen_string_literal: true
class AddUserstampsToCourseUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :course_users,
               :creator_id,
               :integer,
               null: false,
               foreign_key: { references: :users }
    add_column :course_users,
               :updater_id,
               :integer,
               null: false,
               foreign_key: { references: :users }
  end
end
