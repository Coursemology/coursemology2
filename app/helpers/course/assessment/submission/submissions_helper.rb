# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsHelper
  include Course::Assessment::Submission::SubmissionsGuidedHelper
  include Course::Assessment::Answer::ProgrammingHelper

  # Finds the comment being created/edited, or constructs a new one in reply to the latest post.
  #
  # @param [Course::Discussion::Topic] topic The topic being replied to.
  # @return [Course::Discussion::Post]
  def new_comments_post(topic)
    new_post = topic.posts.find(&:new_record?)
    return new_post if new_post

    topic.posts.build
  end

  # Return the CSS class of the explanation based on the correctness of the answer.
  #
  # @return [String]
  def explanation_panel_class(answer)
    answer.correct ? 'panel-success' : 'panel-danger'
  end
end
