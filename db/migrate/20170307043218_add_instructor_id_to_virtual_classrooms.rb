# frozen_string_literal: true
class AddInstructorIdToVirtualClassrooms < ActiveRecord::Migration[4.2]
  def change
    add_column :course_virtual_classrooms, :instructor_id, :integer, index: true, foreign_key: false
    add_foreign_key :course_virtual_classrooms, :users,
                    column: :instructor_id,
                    on_update: :cascade, on_delete: :nullify
  end
end
