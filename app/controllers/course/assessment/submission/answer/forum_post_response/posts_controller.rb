# frozen_string_literal: true
class Course::Assessment::Submission::Answer::ForumPostResponse::PostsController < \
  Course::Assessment::Submission::Answer::Controller
  def selected
    @answer = Course::Assessment::Answer.find_by(id: post_params[:answer_id]).specific
  end

  private

  def post_params
    params.permit(:answer_id)
  end
end
