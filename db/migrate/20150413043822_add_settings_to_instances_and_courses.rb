class AddSettingsToInstancesAndCourses < ActiveRecord::Migration
  def change
    add_column :instances, :settings, :text
    add_column :courses, :settings, :text
  end
end
