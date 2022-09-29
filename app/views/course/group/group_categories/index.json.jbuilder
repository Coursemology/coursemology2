# frozen_string_literal: true

json.groupCategories viewable_group_categories.ordered_by_name do |group_category|
  json.id group_category.id
  json.name group_category.name
end

json.permissions do
  json.canCreate can?(:create, Course::GroupCategory.new(course: current_course))
end
