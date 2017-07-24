# frozen_string_literal: true
module Course::Assessment::Submission::WorkflowEventConcern
  extend ActiveSupport::Concern

  included do
    before_validation :assign_experience_points, if: :workflow_state_changed?
  end

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all current answers as well.
  def finalise(_ = nil)
    self.submitted_at = Time.zone.now
    current_answers.select(&:attempting?).each(&:finalise!)
  end

  # Handles the marking of a submission.
  #
  # This will grade all the answers, and set the points_awarded as a draft.
  def mark(_ = nil)
    publish_answers
  end

  def unmark(_ = nil)
    answers.each do |answer|
      answer.unmark! if answer.graded?
    end
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
    if persisted? && !assessment.autograded? && submission_graded_email_enabled?
      execute_after_commit { Course::Mailer.submission_graded_email(self).deliver_later }
    end
  end

  # Handles the unsubmission of a submitted submission.
  def unsubmit(_ = nil)
    # Skip the state validation in answers.
    @unsubmitting = true

    unsubmit_current_answers
    self.points_awarded = nil
    self.draft_points_awarded = nil
    self.awarded_at = nil
    self.awarder = nil
    self.submitted_at = nil
    self.publisher = nil
    self.published_at = nil
  end

  private

  def submission_graded_email_enabled?
    Course::Settings::AssessmentsComponent.email_enabled?(assessment.tab.category, :grades_released)
  end

  # Defined outside of the workflow transition as points_awarded and draft_points_awarded are
  # not set during the event transition, hence they are not modifiable within the method itself.
  def assign_experience_points
    # publish event (from grade) - Deduce points awarded from draft or updated attribute.
    if workflow_state == 'published' &&
       (workflow_state_was == 'graded' || workflow_state_was == 'submitted')
      self.points_awarded ||= draft_points_awarded
      self.draft_points_awarded = nil
    end
  end

  def publish_answers
    answers.each do |answer|
      answer.publish! if answer.submitted? || answer.evaluated?
    end
  end

  def unsubmit_current_answers
    current_answers.each do |answer|
      answer.unsubmit! unless answer.attempting?
    end
  end
end
