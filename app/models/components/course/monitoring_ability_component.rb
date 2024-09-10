# frozen_string_literal: true
module Course::MonitoringAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_owners_managing_monitoring_monitors_sessions_heartbeats
    allow_teaching_assistants_read_and_delete_update_monitors
    allow_observers_read_monitors_sessions_heartbeats
    allow_students_create_read_update_sessions_heartbeats

    super
  end

  private

  def allow_owners_managing_monitoring_monitors_sessions_heartbeats
    return unless course_user&.manager_or_owner?

    can :manage, Course::Monitoring::Monitor
    can :manage, Course::Monitoring::Session
    can :manage, Course::Monitoring::Heartbeat
  end

  def allow_teaching_assistants_read_and_delete_update_monitors
    return unless course_user&.teaching_assistant?

    can [:read, :delete], Course::Monitoring::Monitor
    can [:read, :delete, :update], Course::Monitoring::Session
    can :read, Course::Monitoring::Heartbeat
  end

  def allow_observers_read_monitors_sessions_heartbeats
    return unless course_user&.observer?

    can :read, Course::Monitoring::Monitor
    can :read, Course::Monitoring::Session
    can :read, Course::Monitoring::Heartbeat
  end

  def allow_students_create_read_update_sessions_heartbeats
    return unless course_user&.student?

    can [:create, :read, :update], Course::Monitoring::Session, creator_id: user.id
    can :create, Course::Monitoring::Heartbeat, session: { creator_id: user.id }
    can :seb_payload, Course::Assessment, course_id: course.id
  end
end
