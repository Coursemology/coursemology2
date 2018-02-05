# frozen_string_literal: true
class CreateUserIdentities < ActiveRecord::Migration[4.2]
  def change
    create_table :user_identities do |t|
      t.references :user, null: false
      t.string :provider, null: false
      t.string :uid, null: false

      t.timestamps null: false
    end
    add_index :user_identities, [:provider, :uid], unique: true
  end
end
