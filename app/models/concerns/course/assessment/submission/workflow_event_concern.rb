# frozen_string_literal: true
module Course::Assessment::Submission::WorkflowEventConcern
  extend ActiveSupport::Concern

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all current answers as well.
  def finalise(_ = nil)
    self.submitted_at = Time.zone.now
    save!

    answers.reload # Reload answers after saving
    finalise_current_answers

    answers.reload # Reload answers after finalising
    after_finalise_hook
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

    self.published_at = Time.zone.now

    after_publish_hook(send_email)
  end

  # Handles the unsubmission of a submitted submission.
  def unsubmit(_ = nil)
    # Skip the state validation in answers.
    @unsubmitting = true

    recreate_current_answers
    answers.reload

    self.submitted_at = nil
    self.published_at = nil

    after_unsubmit_hook
  end

  # Handles re-submitting a published submission's programming answers when there are
  # changes in the assessment's graded test cases.
  # Unlike calling unsubmit + finalise, this event will not rewrite submission's submitted_at time.
  def resubmit_programming
    # Skip the state validation in answers.
    @unsubmitting = true

    unsubmit_current_answers(only_programming: true)
    self.published_at = nil

    after_unsubmit_hook

    current_answers.select(&:attempting?).each(&:finalise!)

    after_resubmit_programming_hook
  end

  # --- Hook seams, called at the exact points the old, single-table WorkflowEventConcern used to
  # inline EXP-specific / course-coupled work. `Attempt` and `Submission` are sibling classes joined
  # by association, not superclass/subclass, so these cannot be Ruby method overrides — they forward
  # to the associated Submission if one exists. A submission-less (preview) Attempt has no Submission,
  # so `submission` is `nil` and these become no-ops. The real bodies are defined on
  # Course::Assessment::Submission (see submission.rb).
  #
  # `assign_zero_experience_points` is shared by `finalise` and `resubmit_programming`;
  # `after_resubmit_programming_hook` exists as a separate hook for the second call site, which has
  # no single seam it can share with `after_finalise_hook`.
  def after_finalise_hook
    submission&.after_finalise_hook
  end

  def after_publish_hook(send_email = true)
    submission&.after_publish_hook(send_email)
  end

  def after_unsubmit_hook
    submission&.after_unsubmit_hook
  end

  def after_resubmit_programming_hook
    submission&.after_resubmit_programming_hook
  end

  private

  # When a submission is finalised, we will compare the current answer and the latest non-current answers.
  # If they are the same, remove the current answer and mark the latest non-current answer as the current answer
  # to avoid re-grading.
  # Otherwise, regenerate the current answer to ensure chronological order of all answers and grade it.
  # For more details, please refer to the PDF page 2 and below here:
  # https://github.com/Coursemology/coursemology2/files/7606393/Submission.Past.Answers.Issues.pdf
  def finalise_current_answers
    questions.each do |question|
      qn_current_answers, qn_non_current_answers = get_answers_to_question(question)
      # There could be a race condition creating multiple current_answers
      # for a given question in load_or_create_answers and only the first one is used.
      qn_current_answer = qn_current_answers.first

      next if qn_current_answer.nil?

      process_answers_for_question(question, qn_current_answer, qn_non_current_answers)
    end

    # After finalising the current answers, destroy all attempting current answers
    # upon submission finalisation.
    # There could be a race condition creating multiple current_answers
    # for a given question in load_or_create_answers and only the first one is used.
    delete_attempting_current_answers
  end

  def get_answers_to_question(question)
    qn_answers = answers.select { |answer| answer.question_id == question.id }.sort_by(&:created_at)
    qn_current_answers = qn_answers.select(&:current_answer).select(&:attempting?)
    qn_non_current_answers = qn_answers.reject(&:current_answer).reject(&:attempting?)
    [qn_current_answers, qn_non_current_answers]
  end

  def process_answers_for_question(question, qn_current_answer, qn_non_current_answers)
    if qn_non_current_answers.empty? # When there is no past answer (only 1 attempt per question)
      finalise_curr_ans_without_past_answers(qn_current_answer)
    else
      finalise_curr_ans_with_past_answers(question, qn_non_current_answers, qn_current_answer)
    end
  end

  def finalise_curr_ans_without_past_answers(qn_current_answer)
    qn_current_answer.finalise!
    qn_current_answer.save!
  end

  def finalise_curr_ans_with_past_answers(question, qn_non_current_answers, qn_current_answer)
    last_non_current_answer = qn_non_current_answers.last
    is_same_answer = qn_current_answer.specific.compare_answer(last_non_current_answer.specific)

    return if check_autograded_no_partial_answer(is_same_answer)

    if is_same_answer
      # If the latest non-current answer and the current answer are the same,
      # mark the latest non-current answer as the current answer.
      last_non_current_answer.current_answer = true
      # Validations for answer are disabled here in case the answer was previously unsubmitted
      # (see note in recreate_current_answers)
      last_non_current_answer.save(validate: false)
    else
      # Otherwise, we duplicate the current answer to a new one, mark it as the current answer, and finalise it.
      new_answer = question.attempt(qn_current_answer.submission, qn_current_answer)
      new_answer.current_answer = true
      new_answer.finalise!
      new_answer.save!
    end
  end

  def check_autograded_no_partial_answer(is_same_answer)
    return unless assessment.autograded && !assessment.allow_partial_submission && !is_same_answer

    self.has_unsubmitted_or_draft_answer = true
  end

  def delete_attempting_current_answers
    answers.current_answers.with_attempting_state.each(&:destroy!)
  end

  def publish_answers
    answers.each do |answer|
      answer.publish! if answer.submitted? || answer.evaluated?
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
      # Validations are disabled as we are only updating the current_answer flag and nothing else.
      # There are other answer validations, one example is validate_grade which will make
      # check if the grade of the answer exceeds the maximum grade. In case the maximum grade is reduced
      # but the user keeps the grade unchanged, the validation will fail.
      current_answer.save(validate: false)
      new_answer.save!
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
end
