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
      answer.publish! if answer.submitted?
    end
  end

  # Handles the publishing of a submission.
  #
  # This grades all the answers as well.
  def publish(_ = nil)
    answers.each do |answer|
      answer.publish! if answer.submitted?
    end
    self.publisher = User.stamper || User.system
    self.published_at = Time.zone.now

    assessment.questions.attempt(self, reattempt: true) if assessment.reattemptable?
  end

  # Handles the unsubmission of a submitted submission.
  def unsubmit(_ = nil)
    # Skip the state validation in answers.
    @unsubmitting = true

    unsubmit_latest_answers
    self.points_awarded = nil

    answers.select(&:reattempting?).map(&:mark_for_destruction) if assessment.reattemptable?
  end

  private

  def unsubmit_latest_answers
    latest_answers.each do |answer|
      answer.unsubmit! if answer.submitted? || answer.graded?
    end
  end
end
