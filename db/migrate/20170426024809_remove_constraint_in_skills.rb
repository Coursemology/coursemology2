class RemoveConstraintInSkills < ActiveRecord::Migration[4.2]
  def change
    change_column :course_assessment_skill_branches, :description, :text, null: true
    change_column :course_assessment_skills, :description, :text, null: true
  end
end
