# frozen_string_literal: true

module Course::Statistics::AnswersHelper
  def get_historical_auto_gradings(programming_auto_grading)
    historical = []
    current = programming_auto_grading

    while current&.parent_id
      parent = Course::Assessment::Answer::ProgrammingAutoGrading.find_by(id: current.parent_id)
      historical.unshift(parent) if parent
      current = parent
    end

    historical
  end
end
