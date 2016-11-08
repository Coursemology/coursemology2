class AddGamifiedToCourses < ActiveRecord::Migration
  def change
    add_column :courses, :gamified, :boolean, default: true, null: false
  end
end
