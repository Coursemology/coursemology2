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

  class Job < ActiveRecord::Base
    enum status: [:submitted, :completed, :errored]

    validates :redirect_to, absence: true, if: :submitted?
    validates :error, absence: true, unless: :errored?
  end

  included do
    rescue_from(StandardError) do |exception|
      rescue_tracked(exception)
    end
  end

  # @!attribute [r] job
  #   The Job object which tracks the status of this job.
  attr_reader :job

  # Implements +initialize+, creating the job in the database.
  def initialize(*args)
    super

    @job = Job.create!(id: job_id)
  end

  def perform(*args)
    perform_tracked(*args)
    @job.status = :completed
    @job.save!
  end

  protected

  def perform_tracked(*)
    fail NotImplementedError
  end

  def rescue_tracked(exception)
    @job.status = :errored
    @job.error = { message: exception.to_s }
    @job.save!
  end

  private

  def deserialize_arguments(serialized_arguments)
    result = super

    @job = Job.find(job_id)
    result
  end

  # Specifies that the job should redirect to the given path.
  def redirect_to(path)
    @job.redirect_to = path
  end
end
