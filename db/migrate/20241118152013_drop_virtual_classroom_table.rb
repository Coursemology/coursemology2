class DropVirtualClassroomTable < ActiveRecord::Migration[7.0]
  def change
    drop_table :course_virtual_classrooms
  end
end
