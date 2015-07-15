module ApplicationComponentsConcern
  extend ActiveSupport::Concern

  included do
    rescue_from ComponentNotFoundError, with: :handle_component_not_found
  end

  protected

  def handle_component_not_found(exception)
    @exception = exception
    render file: 'public/404', layout: false, status: 404
  end
end
