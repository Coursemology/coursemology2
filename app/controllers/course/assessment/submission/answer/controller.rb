# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Controller < \
  Course::Assessment::Submission::Controller

  load_resource :answer, class: Course::Assessment::Answer.name, through: :submission
  load_resource :actable, class: Course::Assessment::Answer::Programming.name,
                          singleton: true, through: :answer
  load_resource :actable, class: Course::Assessment::Answer::Scribing.name,
                          singleton: true, through: :answer
end
