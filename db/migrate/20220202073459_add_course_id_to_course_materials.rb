class AddCourseIdToCourseMaterials < ActiveRecord::Migration[6.0]
  def change
    add_column :course_materials, :course_id, :integer
    execute "update course_materials set course_id = f.course_id from course_material_folders f where course_materials.folder_id = f.id"
  end
end
