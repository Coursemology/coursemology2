# frozen_string_literal: true
# Tracks a programming question's move from one language version to another (e.g. Python 3.13 to
# 3.14), so instructors can monitor it, retry it, and revert it.
#
# The upgrade itself is not a new operation: assigning +language+ and saving trips the question's
# existing +process_package+ callback, which enqueues a +ProgrammingImportJob+ and stamps
# +import_job_id+. This record exists because that pointer cannot serve as durable state — it is a
# single overwritable column pointing at a job row documented as ephemeral — and because reverting
# needs to know which language was last known good.
class Course::Assessment::Question::ProgrammingUpgrade < ApplicationRecord
  include Workflow

  workflow do
    # The upgrade has been requested but its import job has not been observed yet. A question with no
    # attachment never spawns one, so +pending+ may complete directly.
    state :pending do
      event :run, transitions_to: :running
      event :complete, transitions_to: :completed
      event :fail, transitions_to: :failed
    end
    state :running do
      event :complete, transitions_to: :completed
      event :fail, transitions_to: :failed
    end
    # Re-upgrading a question that already succeeded overwrites this row: the previous upgrade's
    # details no longer serve a purpose once its target became the current language.
    state :completed do
      event :start, transitions_to: :pending
    end
    state :failed do
      event :start, transitions_to: :pending
      event :revert, transitions_to: :reverting
    end
    # A successful revert destroys the row rather than reaching a terminal state — the pre-upgrade
    # state has been restored, so there is nothing left to track. A failed revert returns to +failed+,
    # where Revert remains available as a retry.
    state :reverting do
      event :fail, transitions_to: :failed
    end
  end

  # How long an in-flight upgrade may sit before it is treated as a zombie. Import jobs can be lost
  # without ever reporting failure, which would otherwise pin a question in +pending+ forever and
  # block any retry.
  STALE_AFTER = 6.hours

  validates :workflow_state, length: { maximum: 255 }, presence: true
  validates :question, presence: true
  validates :old_language, presence: true
  validates :new_language, presence: true
  validates :question_id, uniqueness: { scope: :attachment_id,
                                        if: -> { question_id_changed? || attachment_id_changed? } }

  belongs_to :question, class_name: 'Course::Assessment::Question::Programming', inverse_of: :upgrades
  # The package this upgrade was performed against. An upgrade never mutates the attachment — the
  # import service works on a Tempfile copy — so this is stable for the life of the row, and a row
  # whose attachment is still the question's current one guarantees that +old_language+ was validated
  # against exactly the package on disk.
  belongs_to :attachment, class_name: '::Attachment', inverse_of: nil, optional: true
  # The last known-good language, i.e. what Revert targets. See +carry_forward_old_language+ on the
  # service: after a *failed* upgrade the question already sits on the new language, so this must not
  # be re-read from the question.
  belongs_to :old_language, class_name: 'Coursemology::Polyglot::Language', inverse_of: nil
  belongs_to :new_language, class_name: 'Coursemology::Polyglot::Language', inverse_of: nil
  # @!attribute [r] job
  #   The ProgrammingImportJob spawned by the upgrade. May be null if the job has been cleared.
  belongs_to :job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true

  # Rows whose package is still the question's current one. Only these describe the live state; rows
  # for superseded packages are inert history.
  #
  # The question's package is reached through +attachment_references+ (there is no attachment_id
  # column on the programming table). +has_one_attachment+ caps that at one reference per question,
  # so the LEFT JOIN cannot fan out. IS NOT DISTINCT FROM rather than = so attachment-less questions,
  # where both sides are NULL, match.
  scope :authoritative, (lambda do
    joins(:question).
      joins(<<~SQL.squish).
        LEFT JOIN attachment_references
          ON attachment_references.attachable_id = course_assessment_question_programming.id
         AND attachment_references.attachable_type = 'Course::Assessment::Question::Programming'
      SQL
      where('course_assessment_question_programming_upgrades.attachment_id IS NOT DISTINCT FROM ' \
            'attachment_references.attachment_id')
  end)

  scope :in_flight, -> { where(workflow_state: [:pending, :running, :reverting]) }
  scope :stale, -> { in_flight.where(updated_at: ...STALE_AFTER.ago) }

  # @return [Boolean] Whether this row is in a non-terminal state.
  def in_progress?
    %w[pending running reverting].include?(workflow_state)
  end

  # Whether an upgrade or revert is currently running for this row, blocking a new one.
  #
  # A row that has been in progress beyond +STALE_AFTER+ does not block: its job is presumed lost.
  #
  # @return [Boolean]
  def in_flight?
    in_progress? && !stale?
  end

  # @return [Boolean] Whether this row has been in progress long enough to be presumed a zombie.
  def stale?
    in_progress? && updated_at < STALE_AFTER.ago
  end

  # Brings this row in line with the import job it is waiting on, and reaps it if that job appears to
  # have been lost. Call before serving data, the way the plagiarism page queries SSID before
  # rendering, so a lost job cannot pin a question in a running state forever.
  #
  # A successful revert destroys the row: the pre-upgrade state has been restored, so there is nothing
  # left to track and the question falls back to its language-derived state.
  #
  # @return [self, nil] nil if the row was destroyed, i.e. a revert succeeded.
  def refresh!
    return self unless in_progress?

    # The job's own outcome is checked before +stale?+: a job that finished is authoritative however
    # long the row has been sitting there, and only a job that never reported back is a zombie.
    if job&.completed?
      return nil if reverting? && destroy!

      complete!
    elsif job&.errored? || stale?
      fail!
    else
      return self # Still waiting on the import job.
    end

    # Workflow events only write the attribute in this app — see
    # +Extensions::DeferredWorkflowStatePersistence+ — so a transition has to be saved explicitly.
    save!
    self
  end

  # Whether this row still describes the question's current package. A row stops being authoritative
  # once the instructor replaces the package, because reverting the language alone would no longer
  # restore a state that ever worked.
  #
  # @return [Boolean]
  def authoritative?
    attachment_id == question.attachment&.attachment_id
  end

  def to_partial_path
    'course/assessment/question/programming_upgrade/programming_upgrade'
  end
end
