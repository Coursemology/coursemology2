# frozen_string_literal: true
class CreateUserEmails < ActiveRecord::Migration[4.2]
  def change
    create_table :user_emails do |t|
      t.boolean :primary, null: false, default: false
      t.belongs_to :user,
                   null: false,
                   index: {
                     with: [:primary],
                     conditions: '"primary" <> false',
                     unique: true
                   }
      t.string :email,
               null: false,
               index: {
                 unique: true,
                 case_sensitive: false
               }

      ## Confirmable
      t.string :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string :unconfirmed_email # Only if using reconfirmable
    end

    add_index :user_emails, :confirmation_token, unique: true
  end
end
