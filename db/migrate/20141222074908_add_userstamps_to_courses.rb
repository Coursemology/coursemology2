# frozen_string_literal: true
class AddUserstampsToCourses < ActiveRecord::Migration[4.2]
  def change
    add_column :courses, :updater_id, :integer, null: false, foreign_key: { references: :users }
  end
end
