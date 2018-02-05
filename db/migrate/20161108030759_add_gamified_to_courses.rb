class AddGamifiedToCourses < ActiveRecord::Migration[4.2]
  def change
    add_column :courses, :gamified, :boolean, default: true, null: false
  end
end
