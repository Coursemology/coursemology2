# frozen_string_literal: true
class ApplicationCable::Connection < ActionCable::Connection::Base
  identified_by :current_user

  def connect
    self.current_user = env['warden'].user || reject_unauthorized_connection
  end
end
