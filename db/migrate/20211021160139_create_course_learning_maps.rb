class CreateCourseLearningMaps < ActiveRecord::Migration[6.0]
  def change
    create_table :course_learning_maps do |t|
      t.timestamps
    end
  end
end
