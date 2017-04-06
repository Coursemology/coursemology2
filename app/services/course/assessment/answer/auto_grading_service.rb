# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingService
  class << self
    # Picks the grader for the given answer, then grades into the given
    # +Course::Assessment::Answer::AutoGrading+ object.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    # @param [Boolean] reattempt Whether to reattempt the answer after grading.
    def grade(answer, reattempt = false)
      answer = if answer.question.auto_gradable?
                 pick_grader(answer.question).grade(answer)
               else
                 assign_maximum_grade(answer)
               end
      save!(answer, reattempt)
    end

    private

    # Picks the grader to use for the given question.
    #
    # @param [Course::Assessment::Question] question The question that the needs to be graded.
    # @return [Course::Assessment::Answer::AnswerAutoGraderService] The service object that can
    #   grade this question.
    def pick_grader(question)
      question.auto_grader
    end

    # Save the graded answer. If reattempt is set to true and if the submission is still in an
    # attempting state, a new answer will be created. This is to prevent a race condition to
    # prevent new answers from being created if the submission is attempting.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    # @param [Boolean] reattempt Whether to reattempt the answer after grading.
    def save!(answer, reattempt)
      Course::Assessment::Answer.transaction do
        answer.save!
        # Only create new answer if submission is still in an attempting state.
        if reattempt && answer.submission.reload.attempting?
          new_answer = answer.question.attempt(answer.submission, answer)
          new_answer.save!
        end
      end
    end

    # Grades into the given +Course::Assessment::Answer::AutoGrading+ object. This assigns the grade
    # and makes sure answer is in the correct state.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    # @return [Course::Assessment::Answer] The graded answer. Note that this answer is not persisted
    #   yet.
    def assign_maximum_grade(answer)
      answer.correct = true
      answer.evaluate!

      if answer.question.assessment.autograded?
        answer.publish!
        answer.grade = answer.question.maximum_grade
        answer.grader = User.system
      end
      answer
    end
  end

  # Grades into the given +Course::Assessment::Answer::AutoGrading+ object. This assigns the grade
  # and makes sure answer is in the correct state.
  #
  # @param [Course::Assessment::Answer] answer The answer to be graded.
  # @return [Course::Assessment::Answer] The graded answer. Note that this answer is not persisted
  #   yet.
  def grade(answer)
    grade = evaluate(answer)
    answer.evaluate!

    if answer.question.assessment.autograded?
      answer.publish!
      answer.grade = grade
      answer.grader = User.system
    end
    answer
  end

  # Evaluates and mark the answer as correct or not. This is supposed to be implemented by
  # subclasses.
  #
  # @param [Course::Assessment::Answer] answer The answer to be evaluated.
  # @return [Integer] grade The grade of the answer.
  def evaluate(answer)
    raise 'Not Implemented'
  end
end
