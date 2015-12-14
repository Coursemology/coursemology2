class Course::GroupsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless can_manage_group?

    [
      {
        key: :groups,
        title: I18n.t('course.groups.sidebar_title'),
        type: :admin,
        weight: 3,
        path: course_groups_path(current_course)
      }
    ]
  end

  private

  def can_manage_group?
    can?(:manage, Course::Group.new(course: current_course)) || manageable_groups.any?
  end

  def manageable_groups
    current_course.groups.accessible_by(current_ability, :manage)
  end
end
