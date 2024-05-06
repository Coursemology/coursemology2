# frozen_string_literal: true
class Ability
  include CanCan::Ability
  attr_reader :user, :course, :course_user, :instance_user, :session

  # Load all components which declare abilities.
  AbilityHost.components.each { |component| prepend(component) }

  # Initialize the ability of user.
  #
  # @param [User|nil] user The current user. This can be nil if the no user is logged in.
  # @param [InstanceUser|nil] user The current instance user. This can be nil if the no user is logged in.
  # @param [Course|nil] course The current course. This can be nil if not inside a course.
  # @param [CourseUser|nil] course_user The current course_user. This can be nil if not inside a course
  # @param [string|nil] session_id The session_id of the current user.
  # or user is not part of the course
  def initialize(user, course = nil, course_user = nil, instance_user = nil, session_id = nil)
    @user = user
    @instance_user = instance_user
    @course = course
    @course_user = course_user
    @session_id = session_id
    can :manage, :all if user&.administrator?

    define_permissions
  end

  # Defines abilities for the given user.
  #
  # This is the method to implement when defining permissions for a component. Always call
  # +super+ when implementing this method.
  #
  # Global administrators already have full access.
  #
  # @return [void]
  def define_permissions
  end
end
