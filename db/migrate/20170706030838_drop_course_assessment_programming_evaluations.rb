class DropCourseAssessmentProgrammingEvaluations < ActiveRecord::Migration
  def change
    drop_table :course_assessment_programming_evaluations
    # Delete autograder user
    ActsAsTenant.without_tenant { User.where(role: 2).destroy_all }
  end
end
