# frozen_string_literal: true
class CreateCikgoUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :cikgo_users do |t|
      t.references :user, null: false, index: true, foreign_key: { to_table: :users }
      t.string :provided_user_id, null: false
    end
  end
end
