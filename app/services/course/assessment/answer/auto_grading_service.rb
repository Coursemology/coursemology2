# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingService
  class << self
    # Picks the grader for the given answer, then grades into the given
    # +Course::Assessment::Answer::AutoGrading+ object.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    def grade(answer)
      answer = if answer.question.auto_gradable?
                 pick_grader(answer.question).grade(answer)
               else
                 assign_maximum_grade(answer)
               end
      answer.save!
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
