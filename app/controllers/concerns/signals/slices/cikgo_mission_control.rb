# frozen_string_literal: true
module Signals::Slices::CikgoMissionControl
  def generate_sync_for_cikgo_mission_control
    { mission_control: @pending_threads_count }
  end
end
