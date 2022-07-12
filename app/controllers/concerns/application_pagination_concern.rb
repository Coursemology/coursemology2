# frozen_string_literal: true
module ApplicationPaginationConcern
  extend ActiveSupport::Concern

  protected

  # Retrieves the page number from the GET URL.
  # Note: this is still used in certain Rails pages with pagination. To be removed.
  #
  # @return [Integer] The page number requested.
  # @return [nil] If none was specified.
  def page_param
    params.permit(:page)[:page]
  end

  # Retrieves page number and length from the GET request.
  # Note: this is meant to be used for backend pagination with React pages.
  def new_page_params
    return {} if params[:filter].blank?

    params[:filter].permit(:page_num, :length)
  end
end
