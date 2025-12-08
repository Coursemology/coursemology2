# frozen_string_literal: true
class Course::GroupsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::Group::GroupManagerConcern

  def sidebar_items
    return [] unless show_group_sidebar_item?

    [
      {
        key: self.class.key,
        icon: :groups,
        type: :admin,
        weight: 7,
        path: group_category_url
      }
    ]
  end

  private

  def group_category_url
    if viewable_group_categories.empty?
      course_group_categories_path(current_course)
    else
      course_group_category_path(current_course, viewable_group_categories.ordered_by_name.first)
    end
  end

  # Only show if the user can view all categories or can manage any particular group.
  def show_group_sidebar_item?
    category = Course::GroupCategory.new(course: current_course)
    return true if can?(:read, category)

    !manageable_groups.empty?
  end
end
