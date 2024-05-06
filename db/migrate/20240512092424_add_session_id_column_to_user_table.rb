class AddSessionIdColumnToUserTable < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :session_id, :string
  end
end
