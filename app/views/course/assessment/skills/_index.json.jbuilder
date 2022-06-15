# frozen_string_literal: true
json.permissions do
  json.canCreateSkill can?(:create, Course::Assessment::Skill.new(course: current_course))
  json.canCreateSkillBranch can?(:create, Course::Assessment::SkillBranch.new(course: current_course))
end

json.partial! 'course/assessment/skill_branches/skill_branch', skill_branches: @skill_branches + [nil]
