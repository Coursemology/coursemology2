# frozen_string_literal: true
class AddRoleToEnrolRequest < ActiveRecord::Migration
  def change
    add_column :course_enrol_requests, :role, :integer, null: false, default: 0
  end
end
