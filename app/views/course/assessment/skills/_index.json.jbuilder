# frozen_string_literal: true
json.canCreateSkill  can?(:create, Course::Assessment::Skill.new(course: current_course))
json.canCreateSkillBranch can?(:create, Course::Assessment::SkillBranch.new(course: current_course))

json.headerTitle Course::Assessment::Skill.human_attribute_name(:title)
json.headerDescription Course::Assessment::Skill.human_attribute_name(:description)

json.partial! 'course/assessment/skill_branches/skill_branch', skill_branches: @skill_branches + [nil]
