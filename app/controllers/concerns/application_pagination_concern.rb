module ApplicationPaginationConcern
  extend ActiveSupport::Concern

  protected

  # Retrieves the page number from the GET URL.
  #
  # @return [Fixnum|nil] The page number requested, or +nil+ if none was specified.
  def page_param
    params.permit(:page)[:page]
  end
end
