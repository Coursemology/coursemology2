# frozen_string_literal: true
module Course::Assessment::Submission::WorkflowEventConcern
  extend ActiveSupport::Concern
  include Course::LessonPlan::PersonalizationConcern

  included do
    before_validation :assign_experience_points, if: :workflow_state_changed?
  end

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all current answers as well.
  def finalise(_ = nil)
    self.submitted_at = Time.zone.now
    save!

    current_answers.select(&:attempting?).each(&:finalise!)

    assign_zero_experience_points if assessment.questions.empty?

    # Trigger timeline recomputation
    # NB: We are not recomputing on unsubmission because unsubmit is not done by the student
    update_personalized_timeline_for(course_user)
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
  def publish(_ = nil, send_email = true) # rubocop:disable Style/OptionalBooleanParameter
    publish_answers

    self.publisher = User.stamper || User.system
    self.published_at = Time.zone.now
    self.awarder = User.stamper || User.system
    self.awarded_at = Time.zone.now

    publish_delayed_posts unless assessment.autograded?

    return unless send_email && persisted? && !assessment.autograded? &&
                  submission_graded_email_enabled? &&
                  submission_graded_email_subscribed?

    execute_after_commit { Course::Mailer.submission_graded_email(self).deliver_later }
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

  # Handles re-submitting a published submission's programming answers when there are
  # changes in the assessment's graded test cases.
  # Unlike calling unsubmit + finalise, this event will not rewrite submission's submitted_at time.
  def resubmit_programming
    # Skip the state validation in answers.
    @unsubmitting = true

    unsubmit_current_answers(only_programming: true)
    self.points_awarded = nil
    self.draft_points_awarded = nil
    self.awarded_at = nil
    self.awarder = nil
    self.publisher = nil
    self.published_at = nil

    current_answers.select(&:attempting?).each(&:finalise!)

    assign_zero_experience_points if assessment.questions.empty?
  end

  private

  def submission_graded_email_enabled?
    is_enabled_as_phantom = course_user.phantom? && email_enabled.phantom
    is_enabled_as_regular = !course_user.phantom? && email_enabled.regular
    is_enabled_as_phantom || is_enabled_as_regular
  end

  def submission_graded_email_subscribed?
    !course_user.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?
  end

  def email_enabled
    assessment.course.email_enabled(:assessments, :grades_released, assessment.tab.category.id)
  end

  # finalise event (from attempting) - Assign 0 points as there are no questions.
  def assign_zero_experience_points
    self.points_awarded = 0
    self.awarded_at = Time.zone.now
    self.awarder = User.stamper || User.system
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

  # @param [Boolean] only_programming Whether unsubmission should be done ONLY for
  #   current programming aswers
  def unsubmit_current_answers(only_programming: false)
    answers_to_unsubmit = only_programming ? current_programming_answers : current_answers
    answers_to_unsubmit.each do |answer|
      answer.unsubmit! unless answer.attempting?
    end
  end

  def publish_delayed_posts
    # Publish delayed comments for each question of a submission
    submission_questions.each do |submission_question|
      update_topic_and_posts(submission_question)
    end

    # Publish delayed annotations for each programming question of a submission
    programming_answers = answers.where('actable_type = ?', Course::Assessment::Answer::Programming)

    programming_answers.each do |programming_answer|
      programming_files = programming_answer.specific.files
      programming_files.each do |programming_file|
        annotations = programming_file.annotations
        annotations.each do |annotation|
          update_topic_and_posts(annotation)
        end
      end
    end
  end

  # Update read mark for topic and delayed for posts
  def update_topic_and_posts(topic_actable)
    topic = topic_actable.discussion_topic
    delayed_posts = topic.posts.only_delayed_posts
    unless delayed_posts.empty?
      # Remove 'mark as read' (if any)
      topic.read_marks.where('reader_id = ?', creator.id)&.destroy_all
      delayed_posts.update_all(is_delayed: false)
    end
    true
  end
end
