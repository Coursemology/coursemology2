# frozen_string_literal: true
class CreateMonitoring < ActiveRecord::Migration[6.0]
  def change
    create_table :course_monitoring_monitors do |t|
      t.boolean :enabled, null: false, default: false
      t.string :seb_hash
      t.integer :min_interval_ms, null: false
      t.integer :max_interval_ms, null: false
      t.integer :offset_ms, null: false, default: 0

      t.timestamps null: false
    end

    create_table :course_monitoring_sessions do |t|
      t.references :monitor, null: false, foreign_key: { to_table: :course_monitoring_monitors }
      t.integer :status, null: false, default: 0
      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_monitoring_sessions_creator_id' }

      t.timestamps null: false
    end

    create_table :course_monitoring_heartbeats do |t|
      t.references :session, null: false, index: true, foreign_key: { to_table: :course_monitoring_sessions }
      t.string :user_agent, null: false
      t.string :seb_hash
      t.string :ip_address
      t.datetime :generated_at, null: false, index: true
      t.boolean :stale, null: false, default: false

      t.timestamps null: false
    end

    change_table :course_assessments do |t|
      t.references :monitor, foreign_key: { to_table: :course_monitoring_monitors }
    end
  end
end
