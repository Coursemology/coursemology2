class RemoveDraftProgrammingAnswerColumn < ActiveRecord::Migration[7.0]
  def change
    remove_column :course_assessments, :allow_record_draft_answer, :boolean
  end
end
