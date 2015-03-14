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
    can :manage, Course, creator_id: user.id
    can :manage, :all if user.administrator?
  end
end
