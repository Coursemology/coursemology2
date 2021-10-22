class CreateCourseLearningMaps < ActiveRecord::Migration[6.0]
  def change
    create_table :course_learning_maps do |t|
      t.references :course, null: false, foreign_key: { to_table: :courses },
                            index: { name: 'fk__course_learning_maps_course_id' }
      t.timestamps
    end
  end
end
