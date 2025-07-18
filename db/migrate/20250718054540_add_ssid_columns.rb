class AddSsidColumns < ActiveRecord::Migration[7.2]
  def change
    # for course
    add_column :courses, :ssid_folder_id, :uuid, null: true
    add_index :courses, :ssid_folder_id, unique: true

    # for assessment
    add_column :course_assessments, :ssid_folder_id, :uuid, null: true
    add_index :course_assessments, :ssid_folder_id, unique: true

    # for submission
    add_column :course_assessment_submissions, :ssid_submission_id, :uuid, null: true
    add_index :course_assessment_submissions, :ssid_submission_id, unique: true

    # assessment similarity check table
    create_table :course_assessment_similarity_checks do |t|
      t.datetime :created_at, precision: nil, null: false
      t.datetime :updated_at, precision: nil, null: false
      t.datetime :last_started_at, precision: nil, null: true
      t.string :workflow_state, limit: 255, null: false, default: "not_started"
      t.references :assessment, null: false, foreign_key: { to_table: :course_assessments, name: 'fk_course_assessment_similarity_checks_assessment_id' }, index: { name: 'fk__course_assessment_similarity_checks_assessment_id', unique: true }
      t.references :job, type: :uuid, null: true, foreign_key: { to_table: :jobs, name: 'fk_course_assessment_similarity_checks_job_id', on_delete: :nullify }, index: { name: 'fk__course_assessment_similarity_checks_job_id', unique: true }
    end
  end
end
