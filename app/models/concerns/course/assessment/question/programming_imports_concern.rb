# frozen_string_literal: true
#
# How changes to a programming question's package are serialised and ordered.
#
# A question's package, test cases and template files change together: an import replaces them, and removing the
# package clears them. Every such change, and every push of the question to Codaveri, first locks the question's
# row (#lock_package!, or `with_lock`), so that they apply one at a time and each sees the previous one's result. The
# lock is held only for the transaction that writes the change, never while a package is evaluated.
#
# An edit that needs its package imported records the import job on the question in the edit's own transaction,
# before the job can run (#schedule_import). So the recorded job is always that of the latest edit to commit. An
# import that, holding the lock, finds a different job recorded, or none because the package has since been removed,
# has been superseded, and stops without changing anything. See Course::Assessment::Question::ProgrammingImportService.
module Course::Assessment::Question::ProgrammingImportsConcern
  extend ActiveSupport::Concern

  # Locks this question's row until the end of the current transaction, without reloading the record.
  #
  # @return [String, nil] The id of the question's import job, as recorded now.
  # @raise [RuntimeError] Outside a transaction, where the lock would be released at once.
  def lock_package!
    raise 'lock_package! must be called within a transaction' unless self.class.with_connection(&:transaction_open?)

    self.class.unscoped.where(id: id).lock.pick(:import_job_id)
  end

  private

  # Schedules an import of the given package, recording its job as the question's import job in this save.
  #
  # @param [AttachmentReference] package The package to import.
  # @param [Hash{String => Object}, nil] previous_version See ProgrammingImportJob#perform_tracked.
  def schedule_import(package, previous_version)
    import_job = Course::Assessment::Question::ProgrammingImportJob.
                 new(self, package, max_time_limit, previous_version)
    import_job.job.save!
    self.import_job = import_job.job

    ActiveRecord.after_all_transactions_commit do
      package.save!
      enqueue_import(import_job)
    end
  end

  # A job that cannot be queued is recorded as failed, so that the question is not left waiting on an import that
  # never runs, and the next save retries it.
  def enqueue_import(import_job)
    import_job.enqueue
  rescue StandardError => e
    import_job.job.update!(status: :errored, error: { class: e.class.name, message: e.message })
    raise
  end

  # Records a Codaveri push as the question's import job, for the edit page to follow, unless an import is still to
  # run: replacing that import's record would supersede it.
  #
  # @param [Course::Assessment::Question::CodaveriImportJob] codaveri_import_job
  def record_codaveri_import_job(codaveri_import_job)
    self.class.transaction do
      recorded_job_id = lock_package!
      next if recorded_job_id && TrackableJob::Job.where(id: recorded_job_id).pick(:status) == 'submitted'

      update_column(:import_job_id, codaveri_import_job.job_id)
    end
  end
end
