# frozen_string_literal: true
class ApplicationCable::Connection < ActionCable::Connection::Base
  identified_by :current_user, :current_session_id

  include ApplicationCableAuthenticationConcern

  def connect
    self.current_user = current_user_from_token || reject_unauthorized_connection
    self.current_session_id = retrieve_current_session_id
  end
end
