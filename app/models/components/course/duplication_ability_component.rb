# frozen_string_literal: true
module Course::DuplicationAbilityComponent
  include AbilityHost::Component

  def define_permissions
    disallow_superusers_duplicate_via_frontend if user
    allow_administrator_to_duplicate_cross_instances if user&.administrator?
    allow_instance_admin_to_duplicate_cross_instances
    allow_instance_instructor_to_duplicate_cross_instances

    if course_user
      allow_managers_duplicate_to_course if course_user.manager_or_owner?
      allow_managers_duplicate_from_course if course_user.manager_or_owner?
      allow_observers_duplicate_from_course if course_user.observer?
    end

    super
  end

  private

  # Restrict the lists of courses that superusers can duplicate to and from.
  # Without this, the lists will consist of all courses in the instance.
  def disallow_superusers_duplicate_via_frontend
    cannot :duplicate_to, Course
    cannot :duplicate_from, Course
  end

  def allow_administrator_to_duplicate_cross_instances
    can :duplicate_across_instances, Instance
  end

  def allow_instance_admin_to_duplicate_cross_instances
    can :duplicate_across_instances, Instance do |instance|
      instance.instance_users.administrator.exists?(user_id: user.id)
    end
  end

  def allow_instance_instructor_to_duplicate_cross_instances
    can :duplicate_across_instances, Instance do |instance|
      instance.instance_users.instructor.exists?(user_id: user.id)
    end
  end

  def allow_managers_duplicate_to_course
    can :duplicate_to, Course
  end

  def allow_managers_duplicate_from_course
    can :duplicate_from, Course
  end

  def allow_observers_duplicate_from_course
    can :duplicate_from, Course
  end
end
