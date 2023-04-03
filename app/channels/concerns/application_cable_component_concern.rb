# frozen_string_literal: true
module ApplicationCableComponentConcern
  extend ActiveSupport::Concern

  included do
    before_subscribe :load_current_component_host
    before_subscribe :check_component
  end

  def current_component_host
    @current_component_host ||= Course::ControllerComponentHost.new(self)
  end

  private

  alias_method :load_current_component_host, :current_component_host

  def component
    raise ComponentNotFoundError
  end

  # TODO: Raise and use `rescue_from` in `included` once in Rails 6.1+
  def check_component
    reject unless component
  rescue ComponentNotFoundError
    reject
  end
end
