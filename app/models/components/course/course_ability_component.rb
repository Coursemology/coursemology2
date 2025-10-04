# frozen_string_literal: true
module Course::CourseAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_instructors_create_courses
      allow_unregistered_users_registering_courses
    end

    if course_user
      allow_registered_users_showing_course
      allow_staff_show_course_users if course_user.staff?
      define_teaching_staff_course_permissions if course_user.teaching_staff?
      define_owners_course_permissions if course_user.manager_or_owner?
      if !course_user.user.administrator? &&
         !course_user.user.instance_users.administrator.exists?(instance_id: course.instance_id) &&
         course_user.role == 'manager'
        disallow_managers_delete_course
      end
    end

    super
  end

  private

  def allow_instructors_create_courses
    can :create, Course if user.instance_users.instructor.present?
  end

  def allow_unregistered_users_registering_courses
    can :create, Course::EnrolRequest, course: { enrollable: true }
    can :destroy, Course::EnrolRequest, user_id: user.id
  end

  def allow_registered_users_showing_course
    can :read, Course, id: course.id
  end

  def allow_staff_show_course_users
    can :show_users, Course, id: course.id
  end

  def define_teaching_staff_course_permissions
    allow_teaching_staff_manage_personal_times
    allow_teaching_staff_analyze_videos
    allow_teaching_staff_manage_course_rubrics
  end

  def allow_teaching_staff_manage_personal_times
    can :manage_personal_times, Course, { id: course.id, show_personalized_timeline_features: true }
  end

  def allow_teaching_staff_analyze_videos
    can :analyze_videos, Course, id: course.id
  end

  def allow_teaching_staff_manage_course_rubrics
    can :manage, Course::Rubric, course_id: course.id
  end

  def define_owners_course_permissions
    allow_owners_managing_course
  end

  def allow_owners_managing_course
    can :manage, Course, id: course.id
    can :manage_users, Course, id: course.id
    can :manage, CourseUser, course_id: course.id
    can :manage, Course::EnrolRequest, course_id: course.id
  end

  def disallow_managers_delete_course
    cannot :destroy, Course, id: course.id
  end
end
