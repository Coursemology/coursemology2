# frozen_string_literal: true
class Course::Assessment::Condition::ScholaisticAssessmentsController <
  Course::Condition::ScholaisticAssessmentsController
  include Course::AssessmentConditionalConcern
end
