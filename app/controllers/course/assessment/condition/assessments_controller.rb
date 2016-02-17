# frozen_string_literal: true
class Course::Assessment::Condition::AssessmentsController <
  Course::Condition::AssessmentsController
  include Course::AssessmentConditionalConcern
end
