# frozen_string_literal: true
class SetTimestampsNullity < ActiveRecord::Migration
  def change
    change_column_null :users, :created_at, false
    change_column_null :users, :updated_at, false
    change_column_null :instance_users, :created_at, false
    change_column_null :instance_users, :updated_at, false
    change_column_null :courses, :created_at, false
    change_column_null :courses, :updated_at, false
    change_column_null :course_users, :created_at, false
    change_column_null :course_users, :updated_at, false
  end
end
