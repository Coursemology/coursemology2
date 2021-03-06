class DropCourseAssessmentProgrammingEvaluations < ActiveRecord::Migration[4.2]
  def change
    drop_table :course_assessment_programming_evaluations
    # Delete autograder user
    ActsAsTenant.without_tenant { User.where(role: 2).destroy_all }
  end
end
