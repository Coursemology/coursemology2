# frozen_string_literal: true
class Course::UsersComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::UnreadCountsConcern

  def self.can_be_disabled_for_course?
    false
  end


  def sidebar_items
    main_sidebar_items + admin_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :users,
        icon: :users,
        weight: 7,
        path: course_users_path(current_course)
      }
    ]
  end

  # Direct the 'Manage Users' link to the usual course_users_students_path if current course user is a manager,
  # otherwise direct it to manage personalized timelines.
  def admin_sidebar_items
    can_manage_users = can?(:manage_users, current_course)
    can_manage_personal_times =
      current_course.show_personalized_timeline_features? && can?(:manage_personal_times, current_course)

    return [] unless can_manage_users || can_manage_personal_times

    [
      {
        key: :admin_users_manage_users,
        icon: :manageUsers,
        type: :admin,
        weight: 2,
        path:
          if can_manage_users
            course_users_students_path(current_course)
          else
            personal_times_course_users_path(current_course)
          end,
        unread: pending_enrol_requests_count
      }
    ]
  end
end
