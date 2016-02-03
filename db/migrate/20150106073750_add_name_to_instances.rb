# frozen_string_literal: true
class AddNameToInstances < ActiveRecord::Migration
  def change
    add_column :instances, :name, :string, null: false, unique: true
  end
end
