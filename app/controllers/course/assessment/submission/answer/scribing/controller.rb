# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Scribing::Controller < \
  Course::Assessment::Submission::Answer::Controller

  before_action :set_scribing_answer
  load_resource :scribbles, class: Course::Assessment::Answer::ScribingScribble.name,
                            through: :scribing_answer

  private

  def set_scribing_answer
    @scribing_answer = @actable
    remove_instance_variable(:@actable)
  end
end
