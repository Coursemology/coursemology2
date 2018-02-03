# frozen_string_literal: true
class RenameLecturesToVirtualClassrooms < ActiveRecord::Migration[4.2]
  def change
    rename_table :course_lectures, :course_virtual_classrooms
  end
end
