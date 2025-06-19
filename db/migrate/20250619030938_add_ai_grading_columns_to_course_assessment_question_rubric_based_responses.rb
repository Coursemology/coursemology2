class AddAiGradingColumnsToCourseAssessmentQuestionRubricBasedResponses < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessment_question_rubric_based_responses, :ai_grading_enabled, :boolean, null: false, default: true
    add_column :course_assessment_question_rubric_based_responses, :ai_grading_custom_prompt, :string, null: false, default: ''
  end
end
