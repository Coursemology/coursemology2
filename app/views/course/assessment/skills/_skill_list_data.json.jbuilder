# frozen_string_literal: true

json.id skill.id
json.title skill.title
json.branchId skill.skill_branch_id
json.description format_html(skill.description)
json.permissions do
  json.canUpdate can?(:update, skill)
  json.canDestroy can?(:destroy, skill)
end
