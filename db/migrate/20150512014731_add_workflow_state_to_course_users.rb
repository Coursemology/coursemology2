# frozen_string_literal: true
class AddWorkflowStateToCourseUsers < ActiveRecord::Migration
  def change
    add_column :course_users, :workflow_state, :string, null: false
  end
end
