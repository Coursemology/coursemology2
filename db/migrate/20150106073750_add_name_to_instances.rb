# frozen_string_literal: true
class AddNameToInstances < ActiveRecord::Migration[4.2]
  def change
    add_column :instances, :name, :string, null: false, unique: true
  end
end
