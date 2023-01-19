# frozen_string_literal: true
class Course::Assessment::Submission::CalculateExpService
  class << self
    # Updates the exp for an autograded submission that will be awarded by the system
    # and the awarding time is the current time.
    # @param [Course::Assessment::Submission] submission The answer to be graded.
    def update_exp(submission)
      submission.points_awarded = calculate_exp(submission).to_i
      submission.awarder = User.system
      submission.awarded_at = Time.zone.now
      submission.save!
    end

    # Calculates the exp given a specific submission of an assessment.
    # Calculating scheme:
    #   Submit before bonus cutoff: ( base_exp + bonus_exp ) * actual_grade / max_grade
    #   Submit after bonus cutoff: base_exp * actual_grade / max_grade
    #   Submit after end_at: 0
    # @param [Course::Assessment::Submission] submission The submission of which the exp needs to be calculated.
    def calculate_exp(submission)
      assessment = submission.assessment
      assessment_time = assessment.time_for(submission.course_user)

      end_at = assessment_time.end_at
      bonus_end_at = assessment_time.bonus_end_at
      total_exp = assessment.base_exp

      return 0 if end_at && submission.submitted_at > end_at

      total_exp += assessment.time_bonus_exp if bonus_end_at && submission.submitted_at <= bonus_end_at

      maximum_grade = submission.questions.sum(:maximum_grade).to_f

      (maximum_grade == 0) ? total_exp : (submission.grade.to_f / maximum_grade * total_exp)
    end
  end
end
