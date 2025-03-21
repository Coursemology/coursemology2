# frozen_string_literal: true
class RagWise::RagWorkflowService
  @prompt = Langchain::Prompt.
            load_from_path(file_path: 'app/services/rag_wise/prompts/forum_assistant_system_prompt.json')

  class << self
    attr_reader :prompt
  end

  def initialize(course, evaluation_service, character)
    @client = LANGCHAIN_OPENAI
    @evaluation = evaluation_service
    @course = course

    course_materials_tool = RagWise::Tools::CourseMaterialsTool.new(course, @evaluation)
    course_forum_discussions_tool = RagWise::Tools::CourseForumDiscussionsTool.new(course, @evaluation)

    @assistant = Langchain::Assistant.new(
      llm: @client,
      instructions: self.class.prompt.format(character: character),
      tools: [course_materials_tool, course_forum_discussions_tool]
    )
  end

  def get_assistant_response(post, topic)
    query_payload = "query title: #{sanitised_text(topic.title)} query text: #{sanitised_text(post.text)} "
    @evaluation.question = query_payload
    @assistant.add_message(content: "Here is the forum history for this topic, but please note that only the latest
    responses will be provided. Use it to answer question in next message: #{topic_history(topic, query_payload)}")
    first_attachment = post.attachments.first
    if first_attachment
      data = Base64.strict_encode64(first_attachment.open(encoding: 'ASCII-8BIT', &:read))
      @assistant.add_message_and_run!(content: query_payload,
                                      image_url: "data:image/jpeg;base64,#{data}")
    else
      @assistant.add_message_and_run!(content: query_payload)
    end
    response = @assistant.messages.last.content

    @evaluation.answer = response
    response
  end

  private

  def sanitised_text(text)
    ActionController::Base.helpers.strip_tags(text)
  end

  def topic_history(topic, query)
    history = RagWise::DiscussionExtractionService.new(@course, topic, topic.latest_history).call
    history[:topic_description] = query
    history
  end

  # for multiple images, currently not in use
  def images_captions(post)
    images_captions = ''
    llm_service = RagWise::LlmService.new
    post.attachments.each do |attachment|
      images_captions += "#{llm_service.get_image_caption(attachment)} "
    end
    images_captions
  end
end
