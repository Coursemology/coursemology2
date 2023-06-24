# frozen_string_literal: true
class Course::Assessment::Submission::Controller < Course::Assessment::Controller
  load_and_authorize_resource :submission, class: Course::Assessment::Submission.name, through: :assessment
end
