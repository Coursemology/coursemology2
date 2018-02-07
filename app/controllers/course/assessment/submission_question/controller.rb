# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::Controller < Course::Assessment::Controller
  load_and_authorize_resource :submission_question,
                              class: Course::Assessment::SubmissionQuestion.name
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')
end
