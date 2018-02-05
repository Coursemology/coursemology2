class RemoveTokenAuthenticationFromUser < ActiveRecord::Migration[4.2]
  def change
    remove_column :users, :authentication_token
  end
end
