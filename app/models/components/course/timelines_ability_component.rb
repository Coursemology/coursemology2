# frozen_string_literal: true
module Course::TimelinesAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_owners_managing_reference_timelines if course_user&.manager_or_owner?

    super
  end

  private

  def allow_owners_managing_reference_timelines
    can :manage, Course::ReferenceTimeline, course_id: course.id
    can :manage, Course::ReferenceTime, reference_timeline: { course_id: course.id }
  end
end
