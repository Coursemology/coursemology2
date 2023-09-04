# frozen_string_literal: true
module Signals::Slices::EnrolRequests
  include Course::UnreadCountsConcern

  def generate_sync
    { manage_users: pending_enrol_requests_count }
  end
end
