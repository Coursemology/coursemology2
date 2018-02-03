# frozen_string_literal: true
class AddSettingsToInstancesAndCourses < ActiveRecord::Migration[4.2]
  def change
    add_column :instances, :settings, :text
    add_column :courses, :settings, :text
  end
end
