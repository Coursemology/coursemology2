class Ability
  include CanCan::Ability

  # Initialize the ability of user.
  #
  # @param user [User] The current user.
  def initialize(user)
    return unless user

    can :new, Course::EnrolRequest
    can :read, Course do |course|
      course.published? or course.opened?
    end
    if user.administrator?
      can :manage, :all
    end
  end
end
