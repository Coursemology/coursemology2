class Ability
  include CanCan::Ability

  # Initialize the ability of user.
  #
  # @param user [User] The current user.
  def initialize(user)
    # TODO: Replace with just the symbols when Rails 5 is released.
    can :read, Course, status: [Course.statuses[:published], Course.statuses[:opened],
                                'published', 'opened']

    return unless user

    can :manage, :all if user.administrator?
  end
end
