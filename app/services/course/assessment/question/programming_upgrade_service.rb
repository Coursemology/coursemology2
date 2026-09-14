# frozen_string_literal: true
# Moves programming questions from one language version to another (e.g. Python 3.13 to 3.14), and
# reverts them when the resulting import fails.
#
# An upgrade is not a new operation: assigning +language+ and saving trips the question's existing
# +process_package+ callback, which enqueues a +ProgrammingImportJob+ and stamps +import_job_id+.
# This service exists to record what was done so it can be monitored and undone, and to make a bulk
# upgrade atomic.
#
# Processing is deliberately inline rather than wrapped in a job. The language flip costs ~0.3 ms; the
# expensive part is the Docker evaluation, which is already async inside +ProgrammingImportJob+. An
# orchestrator job would not avoid the enqueue cost, it would double it (a second +jobs+ row per
# question), while adding an observable pending state and a second thing that can zombie.
class Course::Assessment::Question::ProgrammingUpgradeService
  # @param [Course] course The course the questions belong to, for its programming time limit.
  # @param [User] user The user performing the upgrade.
  def initialize(course, user)
    @course = course
    @user = user
  end

  # Upgrades each question to its requested language.
  #
  # @param [Hash{Course::Assessment::Question::Programming => Coursemology::Polyglot::Language}]
  #   targets The language each question should be moved to.
  # @return [Array<(Array<Course::Assessment::Question::ProgrammingUpgrade>, Hash)>] The upgrade rows
  #   that were started, and a hash of question id => reason for each question that was rejected.
  def upgrade(targets)
    # Captured before anything assigns to the questions: this is the revert target for a question
    # that has no upgrade row yet, and the refreshed baseline for one whose last upgrade succeeded.
    previous_languages = targets.keys.to_h { |question| [question.id, question.language] }

    accepted, rejected = partition_by_validity(targets)
    [apply(accepted, previous_languages), rejected]
  end

  # Reverts a failed upgrade, moving the question back to the language it was last known good on.
  #
  # Uses the same mechanism as an upgrade — the only differences are the target and that success
  # destroys the row rather than completing it (see +settle+).
  #
  # @param [Course::Assessment::Question::ProgrammingUpgrade] upgrade The upgrade to undo.
  # @return [Array<(Array<Course::Assessment::Question::ProgrammingUpgrade>, Hash)>]
  def revert(upgrade)
    question = upgrade.question
    previous_languages = { question.id => question.language }

    accepted, rejected = partition_by_validity({ question => upgrade.old_language })
    return [[], rejected] if accepted.empty?

    upgrade.revert!
    upgrade.save! # Workflow events only write the attribute; see +settle+.
    [apply(accepted, previous_languages, reverting: true), rejected]
  end

  private

  # Splits the requested upgrades into those that can proceed and those that cannot, without writing
  # anything.
  #
  # Validating up front (~0.2 ms per question) surfaces a disabled target language, a Codaveri
  # constraint or an out-of-range time limit in the response, rather than as a failed row the
  # instructor has to poll for.
  def partition_by_validity(targets)
    accepted = {}
    rejected = {}

    targets.each do |question, language|
      reason = rejection_reason(question, language)
      if reason
        rejected[question.id] = reason
      else
        accepted[question] = language
      end
    end

    [accepted, rejected]
  end

  # @return [String, nil] Why this question cannot be upgraded now, or nil if it can.
  def rejection_reason(question, language)
    return 'No target language was given.' if language.nil?
    return 'This question is already on that language.' if question.language_id == language.id
    return 'An upgrade is already running for this question.' if question.upgrade&.in_flight?

    validation_error(question, language)
  end

  # Runs the question's own validations against the target language without saving.
  #
  # The question is left with the target assigned. That is harmless: accepted questions are about to
  # be assigned the same language anyway, and rejected ones are discarded. The pre-change language is
  # captured by the caller before this runs.
  def validation_error(question, language)
    question.assign_attributes(language: language, max_time_limit: @course.programming_max_time_limit)
    return nil if question.valid?

    question.errors.full_messages.to_sentence
  end

  # Applies the accepted upgrades in a single transaction, then settles each row against the import
  # job it spawned.
  def apply(targets, previous_languages, reverting: false)
    return [] if targets.empty?

    upgrades = []

    Course::Assessment::Question::Programming.transaction do
      targets.each do |question, language|
        question.max_time_limit = @course.programming_max_time_limit
        question.language = language
        question.save!

        upgrades << upsert_upgrade(question, previous_languages[question.id], language,
                                   reverting: reverting)
      end

      # Registered last, so it runs after the after-commit blocks +evaluate_package+ registered during
      # each +save!+ — by which point +import_job_id+ has been stamped.
      ActiveRecord.after_all_transactions_commit { settle(upgrades, reverting: reverting) }
    end

    upgrades
  end

  # Creates or updates the row tracking this question's current package.
  #
  # +old_language+ is the last known-good language, i.e. what Revert targets. A *completed* upgrade
  # established a new baseline, so it is refreshed to the language the question was on. A *failed* one
  # did not — the language change commits before the import job is even enqueued, so the question is
  # already sitting on the broken version — and the existing target is carried forward untouched.
  def upsert_upgrade(question, previous_language, language, reverting:)
    upgrade = question.upgrade

    if upgrade.nil?
      question.upgrades.create!(attachment: question.attachment&.attachment,
                                creator: @user, updater: @user,
                                old_language: previous_language, new_language: language)
    else
      upgrade.old_language = previous_language if upgrade.completed?
      upgrade.start! unless reverting || upgrade.pending?
      upgrade.update!(new_language: language, updater: @user, job: nil)
      upgrade
    end
  end

  # Moves each row on to the state its import job puts it in.
  #
  # A question with no package never enqueues an import (+process_package+ ends in
  # +evaluate_package if attachment+), so there is nothing to wait for and the operation is already
  # done. A successful revert destroys the row outright: the pre-upgrade state has been restored, so
  # there is nothing left to track.
  # Workflow events only write the attribute in this app — see
  # +Extensions::DeferredWorkflowStatePersistence+ — so every transition below is followed by a save.
  def settle(upgrades, reverting:)
    upgrades.each do |upgrade|
      job_id = upgrade.question.reload.import_job_id

      if job_id.nil?
        next upgrade.destroy! if reverting

        upgrade.complete!
        upgrade.save!
      elsif reverting
        # Stays in :reverting until the import resolves; +refresh!+ settles it from the job's status.
        upgrade.update!(job_id: job_id)
      else
        upgrade.job_id = job_id
        upgrade.run!
        upgrade.save!
      end
    end
  end
end
