# frozen_string_literal: true
class AddTokenAuthenticationToUser < ActiveRecord::Migration[4.2]
  def change
    change_table :users do |t|
      t.string :authentication_token, index: :unique
    end
  end
end
