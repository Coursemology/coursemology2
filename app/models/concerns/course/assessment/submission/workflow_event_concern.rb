# frozen_string_literal: true
module Course::Assessment::Submission::WorkflowEventConcern
  extend ActiveSupport::Concern

  included do
    before_validation :assign_experience_points, if: :workflow_state_changed?
  end

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all the answers as well.
  def finalise(_ = nil)
    self.submitted_at = Time.zone.now
    answers.select(&:attempting?).each(&:finalise!)
  end

  # Handles the marking of a submission.
  #
  # This will grade all the answers, and set the points_awarded as a draft.
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
    self.awarder = User.stamper || User.system
    self.awarded_at = Time.zone.now
    if persisted? && !assessment.autograded?
      execute_after_commit { Course::Mailer.submission_graded_email(self).deliver_later }
    end
  end

  # Handles the unsubmission of a submitted submission.
  def unsubmit(_ = nil)
    # Skip the state validation in answers.
    @unsubmitting = true

    unsubmit_latest_answers
    self.points_awarded = nil
    self.draft_points_awarded = nil
    self.awarded_at = nil
    self.awarder = nil
    self.submitted_at = nil
  end

  private

  # Defined outside of the workflow transition as points_awarded and draft_points_awarded are
  # not set during the event transition, hence they are not modifiable within the method itself.
  def assign_experience_points
    # publish event (from grade) - Deduce points awarded from draft or updated attribute.
    if workflow_state_was == 'graded' && workflow_state == 'published'
      self.points_awarded ||= draft_points_awarded
      self.draft_points_awarded = nil

    # grade event - If points are awarded, ignore draft_points, otherwise use draft_points_awarded.
    elsif workflow_state_was == 'submitted' && workflow_state == 'graded'
      self.draft_points_awarded = points_awarded
      self.points_awarded = nil
    end
  end

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
