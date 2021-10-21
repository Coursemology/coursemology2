class CreateCourseSettingsLearningMapComponents < ActiveRecord::Migration[6.0]
  def change
    create_table :course_settings_learning_map_components do |t|
      t.timestamps
    end
  end
end
