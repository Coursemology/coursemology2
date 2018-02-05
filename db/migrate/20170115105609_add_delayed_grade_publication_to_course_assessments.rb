class AddDelayedGradePublicationToCourseAssessments < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessments, :delayed_grade_publication, :boolean, default: false
  end
end
