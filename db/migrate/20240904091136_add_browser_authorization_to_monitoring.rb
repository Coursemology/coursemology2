class AddBrowserAuthorizationToMonitoring < ActiveRecord::Migration[7.0]
  def change
    change_table :course_monitoring_monitors do |t|
      t.column :browser_authorization, :boolean, null: false, default: true
      t.column :browser_authorization_method, :integer, null: false, default: 0
      t.column :seb_config_key, :string
    end

    change_table :course_monitoring_heartbeats do |t|
      t.column :seb_payload, :jsonb
    end
  end
end
