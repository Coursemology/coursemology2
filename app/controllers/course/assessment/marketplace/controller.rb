# frozen_string_literal: true
class Course::Assessment::Marketplace::Controller < Course::ComponentController
  # display_graded_test_types is defined in Course::Assessment::AssessmentsHelper; the marketplace
  # preview views reuse it, but Rails only auto-includes a controller's own matching helper.
  helper Course::Assessment::AssessmentsHelper
  # last_attempt (reused answer partials, e.g. _multiple_response.json.jbuilder) is defined in
  # Course::Assessment::Submission::SubmissionsHelper, same auto-include gap as above.
  helper Course::Assessment::Submission::SubmissionsHelper

  private

  def component
    current_component_host[:course_assessment_marketplace_component]
  end
end
