class AddTabbedViewToCourseAssessments < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessments, :tabbed_view, :boolean, default: false, null: false
  end
end
