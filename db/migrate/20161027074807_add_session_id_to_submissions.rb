class AddSessionIdToSubmissions < ActiveRecord::Migration
  def change
    add_column :course_assessment_submissions, :session_id, :string, foreign_key: false
  end
end
