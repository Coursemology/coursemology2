class AddDescriptionToCourseGroups < ActiveRecord::Migration[4.2]
  def change
    add_column :course_groups, :description, :text
  end
end
