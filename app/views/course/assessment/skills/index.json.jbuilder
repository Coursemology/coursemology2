# frozen_string_literal: true

skill_branches = @skill_branches + [nil] # nil is added for uncategorized skills
json.skillBranches skill_branches.each do |skill_branch|
  json.partial! 'course/assessment/skill_branches/skill_branch_list_data', skill_branch: skill_branch
end

json.permissions do
  json.canCreateSkill can?(:create, Course::Assessment::Skill.new(course: current_course))
  json.canCreateSkillBranch can?(:create, Course::Assessment::SkillBranch.new(course: current_course))
end
