class AddLogoToCourses < ActiveRecord::Migration
  def change
    add_column :courses, :logo, :text
  end
end
