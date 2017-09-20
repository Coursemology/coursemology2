# frozen_string_literal: true
# This is a mix-in that allows jobs to be trackable. Trackable jobs can be queried at /jobs/<id>.
# A client requesting HTML would see a progress bar; a client requesting JSON will get a status
# message. When the job is complete, the trackable job can specify a path to redirect the user to.
#
# To use this mix-in, implement +perform_tracked+ instead of +perform+, with the same arguments.
# If you intend to use +rescue_from+ and you wish for the job to fail, call +rescue_tracked+ with
# the exception.
#
# Jobs are ephemeral; do not expect jobs to remain after a long period of time. Also since jobs
# are uniquely identified only by ID and do not need authentication, do not leak anything
# sensitive from the job.
module TrackableJob
  extend ActiveSupport::Concern

  class Job < ApplicationRecord
    enum status: [:submitted, :completed, :errored]

    after_save :signal_finished, unless: :submitted?

    validates :redirect_to, absence: true, if: :submitted?
    validates :error, absence: true, unless: :errored?

    private

    def signal_finished
      return unless status_changed?

      execute_after_commit { signal }
    end
  end

  included do
    before_enqueue :save_job
    rescue_from(StandardError) do |exception|
      rescue_tracked(exception)
    end
  end

  # @!attribute [r] job
  #   The Job object which tracks the status of this job.
  attr_reader :job

  # Waits for the asynchronous job to finish.
  #
  # @param [Fixnum] timeout The amount of time to wait.
  # @raise [Timeout::Error] If the timeout was elapsed without the condition being met.
  def wait(timeout = nil)
    wait_result = job.wait(timeout: timeout, while_callback: -> { job.tap(&:reload).submitted? })

    raise Timeout::Error if wait_result.nil?
  end

  # Implements +initialize+, creating or loading the job from the database.
  def initialize(*args)
    super

    @job = Job.find_or_initialize_by(id: job_id)
  end

  def perform(*args)
    logger.debug(message: 'Perform job', id: @job&.id)
    perform_tracked(*args)
    logger.debug(message: 'Finish performing job', id: @job&.id)
    @job.status = :completed
    @job.save!
  end

  def job_id=(job_id)
    super.tap do
      next unless @job
      @job = find_job(job_id)
    end
  end

  protected

  def perform_tracked(*)
    raise NotImplementedError
  end

  def rescue_tracked(exception)
    @job.status = :errored
    @job.error = exception.as_json.reverse_merge(class: exception.class.name,
                                                 message: exception.to_s,
                                                 backtrace: exception.backtrace)
    @job.save!
  end

  private

  # Saves the job to the database.
  #
  # The job is not saved until queueing because the job ID might not be decided.
  def save_job
    @job.save!
  end

  # Specifies that the job should redirect to the given path.
  def redirect_to(path)
    @job.redirect_to = path
  end

  # Find the job with retries.
  # The retry is needed because the transaction to create the trackable job might not have finished.
  def find_job(job_id)
    tries ||= 5
    @job = Job.find(job_id)
  rescue ActiveRecord::RecordNotFound => e
    tries -= 1
    raise e if tries < 1

    sleep 0.1
    retry
  end
end
