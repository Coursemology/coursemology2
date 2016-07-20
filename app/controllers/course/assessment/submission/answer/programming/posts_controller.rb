# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::PostsController < \
  Course::Assessment::Submission::Answer::Programming::Controller

  include Course::Discussion::PostsConcern

  def update
    render status: :bad_request unless super
  end

  def destroy
    render status: :bad_request unless super
  end

  private

  def post_params
    params.require(:discussion_post).permit(:text)
  end

  def line_param
    params.key?(:line_id) ? params[:line_id].to_i : nil
  end

  def discussion_topic
    @annotation.discussion_topic
  end
end
