# frozen_string_literal: true
module ApplicationCableAbilityConcern
  extend ActiveSupport::Concern

  included do
    before_subscribe :load_current_ability
  end

  def current_ability
    @current_ability ||= Ability.new(current_user, current_course, current_course_user, nil, current_session_id)
  end

  def can?(*args)
    current_ability.can?(*args)
  end

  def cannot?(*args)
    current_ability.cannot?(*args)
  end

  alias_method :load_current_ability, :current_ability
end
