class AddSessionIdToSubmissions < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_submissions, :session_id, :string, foreign_key: false
  end
end
