# frozen_string_literal: true

json.skillBranches skill_branches.each do |skill_branch|
  if skill_branch
    json.id skill_branch.id
    json.title skill_branch.title

    unless @skills_service.present?
      json.description format_html(skill_branch.description)
      json.canUpdate can?(:update, skill_branch)
      json.canDestroy can?(:destroy, skill_branch)
    end
  else
    json.id { -1 }
    json.title nil
  end

  json.servicePresent @skills_service.present?
  if @skills_service.present?
    all_skills_in_branch = @skills_service.skills_in_branch(skill_branch)
    json.userSkills all_skills_in_branch&.each do |skill|
      json.partial! 'course/assessment/skills/skill', skill: skill
    end
  else
    skills = @skills.group_by(&:skill_branch)
    json.skills skills[skill_branch]&.each do |skill|
      json.partial! 'course/assessment/skills/skill', skill: skill
    end
  end
end
