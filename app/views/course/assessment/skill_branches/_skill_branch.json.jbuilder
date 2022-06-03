# frozen_string_literal: true

json.skillBranches skill_branches.each do |skill_branch|
  json.id skill_branch.id
  json.title skill_branch.title

  all_skills_in_branch = @skills_service.skills_in_branch(skill_branch)
  json.skills all_skills_in_branch&.each do |skill|
    json.partial! 'course/assessment/skills/skill', skill: skill
  end
end
