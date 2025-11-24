# frozen_string_literal: true
module TmpCleanupHelper
  # Cleans up temporary files/directories used by the calling service.
  # Assumes that the calling service implements `cleanup_entries`.
  def cleanup
    cleanup_entries.each do |entry|
      next unless entry && Pathname.new(entry).exist?

      FileUtils.remove_entry(entry)
    end
  end
end
