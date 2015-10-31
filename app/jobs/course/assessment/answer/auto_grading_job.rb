class Course::Assessment::Answer::AutoGradingJob < ApplicationJob
  # Performs the auto grading.
  #
  # @param [Course::Assessment::Answer::AutoGrading] auto_grading The object to store the grading
  #   results into.
  def perform(auto_grading)
    Course::Assessment::Answer::AutoGradingService.grade(auto_grading)
  end
end
