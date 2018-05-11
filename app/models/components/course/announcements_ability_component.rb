# frozen_string_literal: true
module Course::AnnouncementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_announcements
      allow_staff_read_announcements
      allow_teaching_staff_manage_announcements
    end

    super
  end

  private

  def allow_students_show_announcements
    can :read, Course::Announcement,
        course_all_course_users_hash.reverse_merge(already_started_hash)
  end

  def allow_staff_read_announcements
    can :read, Course::Announcement, course_staff_hash
  end

  def allow_teaching_staff_manage_announcements
    can :manage, Course::Announcement, course_teaching_staff_hash
  end
end
