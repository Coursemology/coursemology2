# frozen_string_literal: true

json.id skill.id
json.title skill.title
if @skills_service.present?
  json.percentage @skills_service.percentage_mastery(skill)
  json.grade @skills_service.grade(skill)
  json.totalGrade skill.total_grade
else
  json.description format_html(skill.description)
  json.canUpdate can?(:update, skill)
  json.canDestroy can?(:destroy, skill)
end
