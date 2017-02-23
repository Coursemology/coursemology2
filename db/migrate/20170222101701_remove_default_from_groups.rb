class RemoveDefaultFromGroups < ActiveRecord::Migration
  def up
    change_column_default :course_groups, :name, nil
  end

  def down
    change_column_default :course_groups, :name, ''
  end
end
