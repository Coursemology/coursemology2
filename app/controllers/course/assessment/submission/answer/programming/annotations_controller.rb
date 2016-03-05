# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::AnnotationsController < \
  Course::Assessment::Submission::Answer::Programming::Controller

  include Course::Discussion::PostsConcern

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

  def line_param
    line = params[:line]
    line ||= params.key?(:annotation) && annotation_params[:line]
    line
  end

  def discussion_topic
    @annotation.discussion_topic
  end

  def create_topic_subscription
    # TODO: Implement topic subscriptions
    true
  end
end
