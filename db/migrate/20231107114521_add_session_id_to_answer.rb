class AddSessionIdToAnswer < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_answers, :last_session_id, :string, null: false, default: ''
    add_column :course_assessment_answers, :client_version, :bigint
  end
end
