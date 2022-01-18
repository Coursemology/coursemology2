# frozen_string_literal: true
class Course::GroupsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.groups.name')
  end

  def sidebar_items
    return [] unless show_group_sidebar_item?

    [
      {
        key: :groups,
        icon: 'share-alt',
        title: I18n.t('course.groups.sidebar_title'),
        type: :admin,
        weight: 7,
        path: if current_course.group_categories.exists?
                course_group_category_path(current_course,
                                           current_course.group_categories.first)
              else
                course_group_categories_path(current_course)
              end
      }
    ]
  end

  private

  def show_group_sidebar_item?
    category = Course::GroupCategory.new(course: current_course)
    return true if can?(:read, category)

    can?(:read, Course::Group.new(group_category: category)) || !manageable_groups.empty?
  end

  def manageable_groups
    current_course.group_categories.groups.accessible_by(current_ability, :manage)
  end
end
