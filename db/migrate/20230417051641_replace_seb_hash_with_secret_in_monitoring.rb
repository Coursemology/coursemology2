# frozen_string_literal: true
class ReplaceSebHashWithSecretInMonitoring < ActiveRecord::Migration[6.0]
  def change
    rename_column :course_monitoring_monitors, :seb_hash, :secret
    remove_column :course_monitoring_heartbeats, :seb_hash
  end
end
