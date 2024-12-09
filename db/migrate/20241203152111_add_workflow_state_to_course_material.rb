class AddWorkflowStateToCourseMaterial < ActiveRecord::Migration[7.2]
  def change
    change_table :course_materials do |t|
      t.string :workflow_state, limit: 255, null: false, default: "not_chunked"
    end
  end
end
