# frozen_string_literal: true
#
# Previous versions of a programming question, kept when an import replaces its test cases so that results
# graded against the old test cases still point at what produced them. A snapshot is a row of the programming
# question table with +current_id+ set to the live question, and -- unlike a live question -- no parent
# question row, so it is never reachable through an assessment. It records when it was superseded and by whose
# edit, in +superseded_at+ and +superseder+. See Course::Assessment::Question::ProgrammingImportService.
module Course::Assessment::Question::ProgrammingSnapshotsConcern
  extend ActiveSupport::Concern

  included do
    belongs_to :current, class_name: 'Course::Assessment::Question::Programming', inverse_of: :snapshots,
                         optional: true
    belongs_to :superseder, class_name: 'User', inverse_of: nil, optional: true
    has_many :snapshots, class_name: 'Course::Assessment::Question::Programming', foreign_key: :current_id,
                         inverse_of: :current, dependent: :destroy

    scope :live, -> { where(current_id: nil) }
  end

  def snapshot?
    current_id.present?
  end

  private

  # This question's columns as they were before the save in progress, for the import job to snapshot if it
  # replaces the test cases. The save commits the new values long before the import runs, so by then the
  # previous version's values are no longer on the row. The editor is recorded as the snapshot's superseder:
  # only this request knows who they are, as the import job runs without a user.
  #
  # Only this table's own columns: under +acts_as+, +attribute_names+ also includes the parent question's.
  #
  # @return [Hash{String => Object}, nil] The column values, or nil for a question not yet saved.
  def attributes_before_save
    return nil if new_record?

    self.class.column_names.index_with { |name| attribute_in_database(name) }.
      merge('superseder_id' => User.stamper&.id)
  end
end
