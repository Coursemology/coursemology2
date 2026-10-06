# frozen_string_literal: true
#
# Makes a snapshot of a programming question, and the test cases and template files it owns, read-only: a snapshot
# records the version that results were graded against, so changing it would misrepresent those results. See
# Course::Assessment::Question::ProgrammingSnapshotsConcern.
#
# Records are neither created on nor updated in a snapshot. Destroying is allowed, so that a question can still be
# deleted together with its snapshots.
#
# Each including model implements #part_of_snapshot?.
#
# NOTE: the guard hooks save callbacks, so callbackless writers (insert!, update_column, update_columns, update_all)
# deliberately bypass it. They are how a snapshot is created and how test cases and template files are moved onto
# it.
module Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern
  extend ActiveSupport::Concern

  included do
    # Before validation, so that a save is refused as read-only rather than for whichever validation a snapshot
    # happens to fail; before save as well, for a save that skips validation.
    before_validation :raise_snapshot_read_only, if: :part_of_snapshot?
    before_save :raise_snapshot_read_only, if: :part_of_snapshot?
  end

  private

  def raise_snapshot_read_only
    raise ActiveRecord::ReadOnlyRecord,
          "#{self.class.name} is part of a snapshot of a programming question, which cannot be changed."
  end
end
