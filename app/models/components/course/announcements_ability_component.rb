# frozen_string_literal: true
module Course::AnnouncementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_students_show_announcements if course_user.student?
      allow_staff_read_announcements if course_user.staff?
      allow_teaching_staff_manage_announcements if course_user.teaching_staff?
    end

    super
  end

  private

  def allow_students_show_announcements
    can :read, Course::Announcement, course_id: course.id, **already_started_hash
  end

  def allow_staff_read_announcements
    can :read, Course::Announcement, course_id: course.id
  end

  def allow_teaching_staff_manage_announcements
    can :manage, Course::Announcement, course_id: course.id
  end
end
