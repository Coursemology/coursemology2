class CreateCourseRequirements < ActiveRecord::Migration
  def change
    create_table :course_requirements do |t|
      t.actable
      t.references :has_requirement, polymorphic: true
      t.index :has_requirement_id
      t.timestamps
    end
  end
end
