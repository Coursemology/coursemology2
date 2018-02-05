class AddFieldsToCourseAssessmentQuestionProgrammingTestCases < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_question_programming_test_cases, :expression, :string
    add_column :course_assessment_question_programming_test_cases, :expected, :string
    remove_column :course_assessment_question_programming_test_cases, :description,
                  :text, null: false
    change_column :course_assessment_question_programming_test_cases, :public,
                  'integer USING public::integer'
    rename_column :course_assessment_question_programming_test_cases, :public, :test_case_type
  end
end
