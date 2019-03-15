class PreventDuplicateAttemptingSubmissions < ActiveRecord::Migration[5.2]
  def change
    add_index :course_assessment_submissions, [:assessment_id, :creator_id], unique: true,
              name: 'unique_assessment_id_and_creator_id_when_attempting',
              where: "workflow_state = 'attempting'"

    # Remove the original index from db/migrate/20160815141617_prevent_duplicate_submissions.rb
    remove_index :course_assessment_submissions, name: 'unique_assessment_id_and_creator_id'
  end
end
