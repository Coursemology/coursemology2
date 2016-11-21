class AddTabbedViewToCourseAssessments < ActiveRecord::Migration
  def change
    add_column :course_assessments, :tabbed_view, :boolean, default: false, null: false
  end
end
