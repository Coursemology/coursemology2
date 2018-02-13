# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::FilesController < \
  Course::Assessment::Submission::Answer::Programming::Controller
  before_action :set_programming_answer
  load_resource :file, class: Course::Assessment::Answer::ProgrammingFile.name,
                       through: :programming_answer

  def download
    send_data @file.content, filename: @file.filename, type: 'text/plain'
  end
end
