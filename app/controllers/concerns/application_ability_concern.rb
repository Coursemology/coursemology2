# frozen_string_literal: true
module ApplicationAbilityConcern
  # Override of Cancancan#current_ability to provide current course.
  def current_ability
    @current_ability ||= Ability.new(current_user, nil, nil, current_instance_user, current_session_id)
  end
end
