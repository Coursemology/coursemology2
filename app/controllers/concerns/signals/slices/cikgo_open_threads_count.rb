# frozen_string_literal: true
module Signals::Slices::CikgoOpenThreadsCount
  def generate_sync_for_cikgo_open_threads_count
    { learn: @open_threads_count }
  end
end
