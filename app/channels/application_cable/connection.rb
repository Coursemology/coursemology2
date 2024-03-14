# frozen_string_literal: true
class ApplicationCable::Connection < ActionCable::Connection::Base
  identified_by :current_user

  include ApplicationCableAuthenticationConcern

  def connect
    self.current_user = current_user_from_token || reject_unauthorized_connection
  end
end
