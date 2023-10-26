# frozen_string_literal: true
class AddMissesToMonitoring < ActiveRecord::Migration[6.0]
  def change
    add_column :course_monitoring_sessions, :misses, :integer, null: false, default: 0
  end
end
