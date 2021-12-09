class AddUserstampsConfirmerWorkflowColumnsToRequestTables < ActiveRecord::Migration[6.0]
  def change
    add_reference :instance_user_role_requests, :creator, foreign_key: { to_table: :users }
    add_reference :instance_user_role_requests, :updater, foreign_key: { to_table: :users }
    add_column :instance_user_role_requests, :workflow_state, :string
    add_column :instance_user_role_requests, :confirmed_at, :datetime
    add_reference :instance_user_role_requests, :confirmer, foreign_key: { to_table: :users }
    add_column :instance_user_role_requests, :rejection_message, :text

    add_reference :course_enrol_requests, :creator, foreign_key: { to_table: :users }
    add_reference :course_enrol_requests, :updater, foreign_key: { to_table: :users }
    add_column :course_enrol_requests, :workflow_state, :string
    add_column :course_enrol_requests, :confirmed_at, :datetime
    add_reference :course_enrol_requests, :confirmer, foreign_key: { to_table: :users }

    fill_userstamps_and_workflow

    change_column_null :instance_user_role_requests, :creator_id, false
    change_column_null :instance_user_role_requests, :updater_id, false
    change_column_null :instance_user_role_requests, :workflow_state, false

    change_column_null :course_enrol_requests, :creator_id, false
    change_column_null :course_enrol_requests, :updater_id, false
    change_column_null :course_enrol_requests, :workflow_state, false

    remove_index :course_enrol_requests, [:course_id, :user_id]
    add_index :course_enrol_requests, [:course_id, :user_id], unique: false
  end

  def fill_userstamps_and_workflow
    ActsAsTenant.without_tenant do
      Instance::UserRoleRequest.reset_column_information
      Instance::UserRoleRequest.find_each do |request|
        request.update!(creator_id: request.user_id, updater_id: request.user_id, workflow_state: 'pending')
      end

      Course::EnrolRequest.reset_column_information
      Course::EnrolRequest.find_each do |request|
        request.update!(creator_id: request.user_id, updater_id: request.user_id, workflow_state: 'pending')
      end
    end
  end
end
