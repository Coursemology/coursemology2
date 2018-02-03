class AddHideTextToCourseAssessmentQuestionTextResponses < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_question_text_responses, :hide_text, :boolean,
               default: false
  end
end
