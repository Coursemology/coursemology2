class AddFieldsToCourseAssessmentAnswerTextResponses < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_question_text_responses, :allow_attachment, :boolean,
               default: false
  end
end
