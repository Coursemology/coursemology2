class Ability
  include CanCan::Ability

  # Initialize the ability of user.
  #
  # @param user [User] The current user.
  def initialize(user)
    return unless user

    if user.administrator?
      can :manage, :all
    end
  end
end
