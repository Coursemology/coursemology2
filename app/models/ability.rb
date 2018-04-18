# frozen_string_literal: true
class Ability
  include CanCan::Ability
  attr_reader :user
  attr_reader :course
  attr_reader :course_user
  attr_reader :session

  # Load all components which declare abilities.
  AbilityHost.components.each { |component| prepend(component) }

  # Initialize the ability of user.
  #
  # @param [User|nil] user The current user. This can be nil if the no user is logged in.
  # @param [Course|nil] course The current course. This can be nil if not inside a course.
  # @param [CourseUser|nil] course_user The current course_user. This can be nil if not inside a course
  # @param [ActionDispatch::Request::Session] session The browser session
  # or user is not part of the course
  def initialize(user, course = nil, course_user = nil, session = nil)
    @user = user
    @course = course
    @course_user = course_user
    @session = session
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
