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
        path: course_groups_path(current_course)
      }
    ]
  end

  private

  def show_group_sidebar_item?
    can?(:read, Course::Group.new(course: current_course)) || !manageable_groups.empty?
  end

  def manageable_groups
    current_course.groups.accessible_by(current_ability, :manage)
  end
end
