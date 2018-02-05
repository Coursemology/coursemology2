# frozen_string_literal: true
class AddWorkflowStateToCourseUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :course_users, :workflow_state, :string, null: false
  end
end
