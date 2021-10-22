class CreateCourseSettingsLearningMapComponents < ActiveRecord::Migration[6.0]
  def change
    create_table :course_settings_learning_map_components do |t|
      t.references :course, null: false, foreign_key: { to_table: :courses },
                            index: { name: 'fk__course_settings_learning_map_components_course_id' }
      t.timestamps
    end
  end
end
