class Course::Assessment::Submission::Answer::Programming::AnnotationsController <
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

  include Course::Discussion::PostsConcern # This needs the annotation loaded.

  def create
    @annotation.class.transaction do
      @post.title = @assessment.title
      if super && @annotation.save
      else
        render status: :bad_request
      end
    end
  end

  private

  def annotation_params
    params.require(:annotation).permit(:line)
  end

  def set_programming_answer
    @programming_answer = @actable
    remove_instance_variable(:@actable)
  end

  def load_existing_annotation
    @annotation ||= begin
      line = params[:line]
      line ||= params.key?(:annotation) && annotation_params[:line]
      return unless line

      @file.annotations.find_by(line: line.to_i)
    end
  end

  def discussion_topic
    @annotation.discussion_topic
  end

  def create_topic_subscription
    # TODO: Implement topic subscriptions
    true
  end
end
