class AddPackageTypeToCourseAssessmentQuestionProgramming < ActiveRecord::Migration
  def change
    add_column :course_assessment_question_programming, :package_type, :integer,
               default: 0, null: false
  end
end
