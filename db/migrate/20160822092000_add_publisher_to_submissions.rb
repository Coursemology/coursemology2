class AddPublisherToSubmissions < ActiveRecord::Migration[4.2]
  change_table :course_assessment_submissions do |t|
    t.integer :publisher_id, foreign_key: { references: :users }
    t.datetime :published_at
  end
end
