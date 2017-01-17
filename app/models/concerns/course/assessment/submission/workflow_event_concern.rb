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
    publish_answers
  end

  # Handles the publishing of a submission.
  #
  # This grades all the answers as well.
  def publish(_ = nil)
    publish_answers

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

  private

  def publish_answers
    answers.each do |answer|
      answer.publish! if answer.submitted? || answer.evaluated?
    end
  end

  def unsubmit_latest_answers
    latest_answers.each do |answer|
      answer.unsubmit! unless answer.attempting?
    end
  end
end
