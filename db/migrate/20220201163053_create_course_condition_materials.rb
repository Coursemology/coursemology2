class CreateCourseConditionMaterials < ActiveRecord::Migration[6.0]
  def change
    create_table :course_condition_materials do |t|
      t.references :material, null: false, foreign_key: { to_table: :course_materials },
                              index: { name: 'fk__course_condition_materials_material_id' }
    end
  end
end
