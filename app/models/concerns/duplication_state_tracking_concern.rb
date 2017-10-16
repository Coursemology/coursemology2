# frozen_string_literal: true
#
# This concern provides methods to track the duplication states.
module DuplicationStateTrackingConcern
  extend ActiveSupport::Concern

  included do
    # Only clear the flag after the transaction is committed.
    # `after_save` could be called multiple times, which could result in the flag to be cleared too early.
    after_commit :clear_duplication_flag
  end

  def set_duplication_flag
    @duplicating = true
  end

  def duplicating?
    !!@duplicating
  end

  def clear_duplication_flag
    @duplicating = nil
  end
end
