class CreateCourseSettingsLearningMapComponents < ActiveRecord::Migration[5.2]
  def change
    create_table :course_settings_learning_map_components do |t|

      t.timestamps
    end
  end
end
