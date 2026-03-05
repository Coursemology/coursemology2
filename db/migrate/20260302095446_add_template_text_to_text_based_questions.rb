class AddTemplateTextToTextBasedQuestions < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessment_question_text_responses, :template_text, :text, null: true
    add_column :course_assessment_question_rubric_based_responses, :template_text, :text, null: true
  end
end
