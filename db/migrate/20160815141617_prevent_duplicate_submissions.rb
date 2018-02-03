class PreventDuplicateSubmissions < ActiveRecord::Migration[4.2]
  def change
    add_index :course_assessment_submissions, [:assessment_id, :creator_id], unique: true,
              name: 'unique_assessment_id_and_creator_id'
  end
end
