class AddCourseToSkillAndSkillBranch < ActiveRecord::Migration[4.2]
  def change
    change_table :course_assessment_skills do |t|
      t.references :course, null: false
    end

    change_table :course_assessment_skill_branches do |t|
      t.references :course, null: false
    end
  end
end
