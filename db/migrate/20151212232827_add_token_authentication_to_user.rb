class AddTokenAuthenticationToUser < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :authentication_token, index: :unique
    end
  end
end
