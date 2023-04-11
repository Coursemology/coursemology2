class AddAllowRecordDraftAnswerToAssessments < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessments, :allow_record_draft_answer, :boolean, default: false
  end
end
