# frozen_string_literal: true
module System::Admin::UsersHelper
  # Wraps the user count in a link unless the the linked page is the current page,
  # or the user count is nil or zero.
  def user_count_link(page_params, user_count, link_params)
    return 0 unless user_count

    link_active = page_params[:active] == link_params[:active] && page_params[:role] == link_params[:role]
    link_active ? user_count : link_to(user_count, link_params)
  end
end
