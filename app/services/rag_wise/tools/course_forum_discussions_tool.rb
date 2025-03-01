# frozen_string_literal: true
class RagWise::Tools::CourseForumDiscussionsTool
  extend Langchain::ToolDefinition

  define_function :get_discussions,
                  description: 'Retrieve past course forum discussions that are semantically closest\
                  to the user query. Always execute this tool.' do
    property :user_query, type: 'string', description: 'Exact user query', required: true
  end

  def initialize(course, evaluation)
    @client = LANGCHAIN_OPENAI
    @course = course
    @evaluation = evaluation
  end

  def get_discussions(user_query:)
    query_embedding = @client.embed(text: user_query, model: 'text-embedding-ada-002').embedding
    data = @course.nearest_forum_discussions(query_embedding)
    @evaluation.question = user_query
    @evaluation.context += data.to_s
    "Below are a list of search results from the past course forum discussions knowledge base: #{data}"
  end
end
