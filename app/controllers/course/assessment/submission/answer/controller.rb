# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Controller < \
  Course::Assessment::Submission::Controller
  load_resource :answer, class: 'Course::Assessment::Answer', through: :submission
  load_resource :actable, class: 'Course::Assessment::Answer::Scribing',
                          singleton: true, through: :answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')
end
