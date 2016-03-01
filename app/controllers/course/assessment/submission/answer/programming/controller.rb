# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::Controller < \
  Course::Assessment::Submission::Controller

  load_resource :answer, class: Course::Assessment::Answer.name, through: :submission
  load_resource :actable, class: Course::Assessment::Answer::Programming.name,
                          singleton: true, through: :answer
  before_action :set_programming_answer
  load_resource :file, class: Course::Assessment::Answer::ProgrammingFile.name,
                       through: :programming_answer
  before_action :load_existing_annotation
  load_resource :annotation, class: Course::Assessment::Answer::ProgrammingFileAnnotation.name,
                             through: :file

  helper Course::Assessment::Answer::ProgrammingHelper.name.sub(/Helper$/, '')

  private

  def set_programming_answer
    @programming_answer = @actable
    remove_instance_variable(:@actable)
  end

  def load_existing_annotation
    @annotation ||= begin
      line = line_param
      return unless line

      @file.annotations.find_by(line: line.to_i)
    end
  end
end
