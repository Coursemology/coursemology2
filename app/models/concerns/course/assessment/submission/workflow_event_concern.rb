# frozen_string_literal: true
module Course::Assessment::Submission::WorkflowEventConcern
  extend ActiveSupport::Concern

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all the answers as well.
  def finalise(_ = nil)
    answers.select(&:attempting?).each(&:finalise!)
  end

  # Handles the marking of a submission. This will grade all the answers.
  def mark(_ = nil)
    answers.each do |answer|
      answer.publish! if answer.submitted? || answer.evaluated?
    end
  end

  # Handles the publishing of a submission.
  #
  # This grades all the answers as well.
  def publish(_ = nil)
    answers.each do |answer|
      answer.publish! if answer.submitted? || answer.evaluated?
    end
    self.publisher = User.stamper || User.system
    self.published_at = Time.zone.now
  end

  # Handles the unsubmission of a submitted submission.
  def unsubmit(_ = nil)
    # Skip the state validation in answers.
    @unsubmitting = true

    unsubmit_latest_answers
    self.points_awarded = nil
  end
end
