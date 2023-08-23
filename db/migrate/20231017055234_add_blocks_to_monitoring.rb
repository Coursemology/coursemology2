# frozen_string_literal: true
class AddBlocksToMonitoring < ActiveRecord::Migration[6.0]
  def change
    add_column :course_monitoring_monitors, :blocks, :boolean, null: false, default: false
  end
end
