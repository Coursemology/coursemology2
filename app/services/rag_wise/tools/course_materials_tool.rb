# frozen_string_literal: true
class RagWise::Tools::CourseMaterialsTool
  extend Langchain::ToolDefinition

  define_function :get_course_materials,
                  description: 'Retrieve the course material chunks that are semantically closest to the user query.' do
    property :user_query, type: 'string', description: 'Exact user query', required: true
    property :material_names, type: 'string',
                              description: 'list of course material names referenced in user query,' \
                                           'e.g., lecture 1, lecture 2....',
                              required: false
  end

  def initialize(course, evaluation)
    @client = LANGCHAIN_OPENAI
    @course = course
    @evaluation = evaluation
  end

  def get_course_materials(user_query:, material_names: nil)
    query_embedding = @client.embed(text: user_query, model: 'text-embedding-ada-002').embedding
    data = if material_names
             handle_material_name_query(query_embedding, material_names)
           else
             fetch_course_materials(query_embedding)
           end
    @evaluation.question = user_query
    @evaluation.context += data
    data
  end

  private

  def handle_material_name_query(query_embedding, material_names)
    materials_list = @course.materials_list.to_s
    actual_material_names = find_actual_material_name(materials_list, material_names)

    if actual_material_names.first == 'NOT FOUND'
      handle_material_not_found(query_embedding, material_names)
    else
      fetch_course_materials(query_embedding, material_names: actual_material_names)
    end
  end

  def handle_material_not_found(query_embedding, material_names)
    alternate_results = fetch_course_materials(query_embedding)
    "MUST ALWAYS Inform user that course materials with names: #{material_names} does not exist. " \
      "Proceeding to search from other course materials: #{alternate_results}"
  end

  def fetch_course_materials(query_embedding, material_names: nil)
    results = @course.nearest_text_chunks(query_embedding, material_names: material_names)
    "Below are a list of search results from the course materials knowledge base: #{results}"
  end

  def find_actual_material_name(materials_list, material_name)
    messages = [
      {
        role: 'system',
        content: Langchain::Prompt.load_from_path(
          file_path: 'app/services/rag_wise/prompts/guess_course_material_name_system_prompt_template.json'
        ).format
      },
      {
        role: 'user',
        content: "Actual Course Materials List: #{materials_list} user query: #{material_name}"
      }
    ]
    response = LANGCHAIN_OPENAI.chat(messages: messages, temperature: 0).chat_completion
    JSON.parse(response)
  end
end
