# frozen_string_literal: true
class RagWise::DiscussionExtractionService
  def initialize(course, topic, posts)
    @course = course
    @topic = topic
    @posts = Course::Discussion::Post.includes(:creator, :attachment_references).where(id: posts.pluck(:id))
  end

  def call
    {
      topic_title: sanitise_text(@topic[:title]),
      discussion: formatted_discussion
    }
  end

  private

  def formatted_discussion
    @posts.filter_map do |post|
      {
        role: post_creator_role(@course, post),
        text: sanitise_text(post[:text])
      }.tap do |hash|
        hash[:image_captions] = image_captions(post) if post.attachments.present?
      end
    end
  end

  def sanitise_text(text)
    ActionController::Base.helpers.strip_tags(text)
  end

  def image_captions(post)
    llm_service = RagWise::LlmService.new

    post.attachments.map do |attachment|
      llm_service.get_image_caption(attachment.open(encoding: 'ASCII-8BIT', &:read))
    end
  end

  def post_creator_role(course, post)
    course_user = course.course_users.find_by(user: post.creator)
    return 'System AI Response' unless course_user || !post[:is_ai_generated]
    return 'Teaching Staff' if course_user&.teaching_staff?
    return 'Student' if course_user&.real_student?

    'Not Found'
  end
end
