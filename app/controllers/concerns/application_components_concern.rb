# frozen_string_literal: true
module ApplicationComponentsConcern
  extend ActiveSupport::Concern

  included do
    rescue_from ComponentNotFoundError, with: :handle_component_not_found
  end

  protected

  def handle_component_not_found(exception)
    @exception = exception
    render 'public/404', layout: false, status: :not_found
  end
end
