# frozen_string_literal: true
module ApplicationPaginationConcern
  extend ActiveSupport::Concern

  protected

  # Retrieves the page number from the GET URL.
  #
  # @return [Integer] The page number requested.
  # @return [nil] If none was specified.
  def page_param
    params.permit(:page)[:page]
  end
end
