class CreateNotificationStyles < ActiveRecord::Migration
  def change
    create_table :notification_styles do |t|
      t.references :activity, index: true, foreign_key: true
      t.string :notification_type

      t.timestamps null: false
    end
  end
end
