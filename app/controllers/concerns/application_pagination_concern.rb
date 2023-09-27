# frozen_string_literal: true
module ApplicationPaginationConcern
  extend ActiveSupport::Concern

  protected

  # Retrieves page number and length from the GET request.
  # Note: this is meant to be used for backend pagination with React pages.
  def page_param
    return {} if params[:filter].blank?

    params[:filter].permit(:page_num, :length)
  end
end
