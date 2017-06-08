class AddDescriptionToCourseGroups < ActiveRecord::Migration
  def change
    add_column :course_groups, :description, :text
  end
end
