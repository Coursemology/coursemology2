# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingService
  class << self
    # Picks the grader for the given answer, then grades into the given
    # +Course::Assessment::Answer::AutoGrading+ object.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    # @param [Course::Assessment::Answer::AutoGrading] auto_grading The auto grading object that will store the results.
    def grade(answer, auto_grading)
      answer = if answer.question.auto_gradable?
                 pick_grader(answer.question).grade(answer, auto_grading)
               else
                 assign_maximum_grade(answer)
               end
      answer.save!
    end

    private

    # Picks the grader to use for the given question.
    #
    # @param [Course::Assessment::Question] question The question that the needs to be graded.
    # @return [Course::Assessment::Answer::AnswerAutoGradingService] The service object that can
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

      if answer.submission.assessment.autograded?
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
    # @param [Course::Assessment::Answer::AutoGrading] auto_grading The auto grading object that will store the results.
  # @return [Course::Assessment::Answer] The graded answer. Note that this answer is not persisted
  #   yet.
  def grade(answer, auto_grading)
    grade = evaluate(answer, auto_grading)
    answer.evaluate!

    if answer.submission.assessment.autograded?
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
    # @param [Course::Assessment::Answer::AutoGrading] auto_grading The auto grading object that will store the results.
  # @return [Integer] grade The grade of the answer.
  def evaluate(_answer, _auto_grading)
    raise 'Not Implemented'
  end
end
