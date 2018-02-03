class RenameAssessmentTagsToSkills < ActiveRecord::Migration[4.2]
  def change
    rename_table :course_assessment_tag_groups, :course_assessment_skill_branches
    rename_table :course_assessment_tags, :course_assessment_skills
    rename_table :course_assessment_questions_tags, :course_assessment_questions_skills

    rename_column :course_assessment_skills, :tag_group_id, :skill_branch_id
    rename_column :course_assessment_questions_skills, :tag_id, :skill_id
  end
end
