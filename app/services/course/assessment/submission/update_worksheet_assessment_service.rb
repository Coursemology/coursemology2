# frozen_string_literal: true
class Course::Assessment::Submission::UpdateWorksheetAssessmentService <
  Course::Assessment::Submission::UpdateService

  private

  # Processes comments from the user.
  #
  # The comments are not complete forms because they have empty fields (such as the title.) The
  # controller fills them up, because the model is not aware of what the discussion topic acts as.
  def update_params
    super.tap do |result|
      next unless result.key?(:answers_attributes)
      result[:answers_attributes].each do |_, answer|
        next unless answer.key?(:discussion_topic_attributes)
        next unless answer[:discussion_topic_attributes].key?(:posts_attributes)

        filter_comment_params(answer[:discussion_topic_attributes][:posts_attributes])
      end
    end
  end

  # Remove all discussion posts with an empty body; posts with body text are augmented with titles.
  def filter_comment_params(posts)
    posts.each do |key, post_attributes|
      posts.delete(key) if post_attributes[:text].blank?
      post_attributes[:title] = @submission.assessment.title
    end
  end

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions
  end

  def update_answers_params
    super.tap do |result|
      options = result.extract_options!
      options[:discussion_topic_attributes] = [:id, posts_attributes: [:parent_id, :title, :text]]
      result.push(options)
    end
  end
end
