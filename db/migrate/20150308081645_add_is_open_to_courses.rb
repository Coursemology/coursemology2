class AddIsOpenToCourses < ActiveRecord::Migration
  def change
    add_column :courses, :is_open, :boolean, default: true
  end
end
