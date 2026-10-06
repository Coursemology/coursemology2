# frozen_string_literal: true
#
# Previous versions of a programming question, kept when an import replaces its test cases or its package is
# removed, so that results graded against the old test cases still point at what produced them. A snapshot is a
# row of the programming question table with +current_id+ set to the live question, and -- unlike a live question
# -- no parent question row, so it is never reachable through an assessment. It records when it was superseded
# and by whose edit, in +superseded_at+ and +superseder+. Snapshots are read-only.
#
# See Course::Assessment::Question::ProgrammingImportService, Course::Assessment::Question::Programming#remove_package
# and Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern.
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

  # Columns a snapshot does not take from the version it records: its own identity, its link to the live
  # question, and the live question's import job, which is unique per question.
  SNAPSHOT_EXCLUDED_COLUMNS = ['id', 'current_id', 'import_job_id'].freeze

  def snapshot?
    current_id.present?
  end

  # Keeps the question's current version, by moving its test cases and template files onto a new snapshot of it
  # before they are replaced or removed. Their ids do not change, so every test result graded against them keeps
  # pointing at the test case that produced it.
  #
  # Call this in the same transaction that replaces or removes them, and before doing so.
  #
  # @param [Hash{String => Object}] version The column values of the version being kept.
  # @param [AttachmentReference, nil] package The reference to that version's package.
  # @return [Course::Assessment::Question::Programming, nil] The snapshot, or nil if there is nothing to keep.
  def snapshot_current_version!(version, package)
    return nil unless persisted? && test_cases.exists?

    create_snapshot(version, package).tap do |snapshot|
      # Moved through the associations deliberately: update_all on an association also resets it. A loaded
      # association still holding the moved rows would delete them when they are next replaced or cleared.
      test_cases.update_all(question_id: snapshot.id)
      template_files.update_all(question_id: snapshot.id)
    end
  end

  private

  # Turning a live question into a snapshot, or a snapshot back into a live question, is a change to a snapshot
  # too. See Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern.
  def part_of_snapshot?
    snapshot? || current_id_in_database.present?
  end

  # Inserted directly rather than through Programming#save!, so that the snapshot has no parent question row
  # and runs none of the callbacks and validations meant for an editable question.
  #
  # @param [Hash{String => Object}] version See #snapshot_current_version!.
  # @param [AttachmentReference, nil] package See #snapshot_current_version!.
  # @return [Course::Assessment::Question::Programming] The snapshot.
  def create_snapshot(version, package)
    # Sliced to this table's columns: under +acts_as+, +attributes+ also includes the parent question's.
    attributes = version.slice(*self.class.column_names).
                 except(*SNAPSHOT_EXCLUDED_COLUMNS).
                 merge('current_id' => id, 'superseded_at' => Time.current)
    snapshot_id = self.class.insert!(attributes, returning: :id).first['id']

    self.class.find(snapshot_id).tap do |snapshot|
      # Attachments are content-addressed, so the snapshot's own reference costs a row and no storage.
      package&.dup&.tap { |reference| reference.attachable = snapshot }&.save!
    end
  end

  # This question's columns as they were before the save in progress, for the version to be snapshotted if its
  # test cases are replaced or removed. An import job replaces them long after the save commits the new values,
  # so by then the previous version's values are no longer on the row. The editor is recorded as the snapshot's
  # superseder: only this request knows who they are, as the import job runs without a user.
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
