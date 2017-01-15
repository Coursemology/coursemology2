class AddDelayedGradePublicationToCourseAssessments < ActiveRecord::Migration
  def change
    add_column :course_assessments, :delayed_grade_publication, :boolean, default: false
  end
end
