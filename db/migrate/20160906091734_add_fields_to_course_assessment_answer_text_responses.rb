class AddFieldsToCourseAssessmentAnswerTextResponses < ActiveRecord::Migration
  def change
    add_column :course_assessment_question_text_responses, :allow_attachment, :boolean,
               default: false
  end
end
