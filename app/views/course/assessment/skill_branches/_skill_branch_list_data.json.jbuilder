# frozen_string_literal: true

if skill_branch
  json.id skill_branch.id
  json.title skill_branch.title
  json.description format_ckeditor_rich_text(skill_branch.description)
  json.permissions do
    json.canUpdate can?(:update, skill_branch)
    json.canDestroy can?(:destroy, skill_branch)
  end
else # Skills without skill branch are categorized here.
  json.id(-1)
  json.title nil
  json.description nil
  json.permissions do
    json.canUpdate false
    json.canDestroy false
  end
end

if @skills
  json.skills @skills[skill_branch]&.each do |skill|
    json.partial! 'course/assessment/skills/skill_list_data', skill: skill
  end
end
