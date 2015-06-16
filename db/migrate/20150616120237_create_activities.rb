class CreateActivities < ActiveRecord::Migration
  def change
    create_table :activities do |t|
      t.references :actor, null: false, foreign_key: { references: :users }
      t.belongs_to :object, null: false, polymorphic: true
      t.string :event, null: false

      t.timestamps null: false
    end
  end
end
