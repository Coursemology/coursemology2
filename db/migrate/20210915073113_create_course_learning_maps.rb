class CreateCourseLearningMaps < ActiveRecord::Migration[5.2]
  def change
    create_table :course_learning_maps do |t|

      t.timestamps
    end
  end
end
