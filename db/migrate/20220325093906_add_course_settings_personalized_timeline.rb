class AddCourseSettingsPersonalizedTimeline < ActiveRecord::Migration[6.0]
  def change
    create_table :course_settings_personalized_timeline do |t|
      t.references :course, null: false, foreign_key: { references: :courses }
      t.float :min_overall_limit # The fastest that a course can be completed
      t.float :max_overall_limit # The slowest that a course can be completed
      t.float :hard_min_learning_rate # The fastest learning rate possible
      t.float :hard_max_learning_rate # The slowest learning rate possible
      t.float :assessment_submission_time_weight
      t.float :assessment_grade_weight
      t.float :video_watch_percentage_weight
      t.timestamps null: false
    end
  end
end
