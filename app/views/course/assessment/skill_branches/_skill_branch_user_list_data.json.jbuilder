# frozen_string_literal: true

json.id skill_branch.id
json.title skill_branch.title

all_skills_in_branch = @skills_service.skills_in_branch(skill_branch)
json.userSkills all_skills_in_branch&.each do |skill|
  json.partial! 'course/assessment/skills/skill_user_list_data', skill: skill
end
