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

    finalise_current_answers
    answers.reload

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

    recreate_current_answers
    answers.reload

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

  # When a submission is unsubmitted, every current_answer is copied as and flagged as attempting.
  # The new copied answer is then marked as current_answer which is the answer that can be modified
  # by users. The old current_answer is unmarked as current_answer and is kept as graded past answer.
  def recreate_current_answers
    current_answers.reject(&:attempting?).each do |current_answer|
      new_answer = current_answer.question.attempt(current_answer.submission, current_answer)

      current_answer.current_answer = false
      new_answer.current_answer = true
      current_answer.save!
      new_answer.save!
    end
  end

  # When a submission is finalised, we will compare the current answer and the latest non-current answers.
  # If they are the same, remove the current answer and mark the latest non-current answer as the current answer
  # to avoid re-grading.
  # Otherwise, regenerate the current answer to ensure chronological order of all answers and grade it.
  # For more details, please refer to the PDF page 2 and below here:
  # https://github.com/Coursemology/coursemology2/files/7606393/Submission.Past.Answers.Issues.pdf
  def finalise_current_answers
    questions.each do |question|
      all_answers = answers.where(question: question)
      current_answer = all_answers.current_answers.select(&:attempting?).first
      next if current_answer.nil?

      # For the case when there is no past answer (only 1 attempt per question),
      # current answer is finalized.
      if all_answers.non_current_answers.reject(&:attempting?).empty?
        current_answer.finalise!
        current_answer.save!
        # It is mentioned that there could be a race condition creating multiple current_answers
        # for a given question in load_or_create_answers. Since we always take the first current_answer,
        # destroy the rest upon submission finalisation.
        all_answers.current_answers.select(&:attempting?).each(&:destroy)
      else
        last_non_current_answer = all_answers.reject(&:current_answer?).reject(&:attempting?).last

        if current_answer.specific.compare_answer(last_non_current_answer.specific)
          # If the latest non-current answer and the current answer are the same, keep the latest non-current answer
          # and remove current answer
          all_answers.current_answers.select(&:attempting?).each(&:destroy)
          last_non_current_answer.update!(current_answer: true)
        else
          # Otherwise, we duplicate the current answer to a new one, and finalise it.
          # We then remove the previous current answer and mark the copied answer as the current answer.
          new_answer = question.attempt(current_answer.submission, current_answer)
          new_answer.finalise!
          new_answer.save!

          all_answers.current_answers.select(&:attempting?).each(&:destroy)
          new_answer.update!(current_answer: true)
        end
      end
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
