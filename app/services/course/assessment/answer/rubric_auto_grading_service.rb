# frozen_string_literal: true
class Course::Assessment::Answer::RubricAutoGradingService <
  Course::Assessment::Answer::AutoGradingService
  MAX_RETRY = 1
  @output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(
    JSON.parse(
      File.read('app/services/course/assessment/answer/prompts/rubric_auto_grading_output_format.json')
    )
  )
  @system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_system_prompt.json'
  ).format(format_instructions: @output_parser.get_format_instructions)
  @user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_user_prompt.json'
  )

  class << self
    attr_reader :system_prompt, :user_prompt, :output_parser
  end

  def evaluate(answer)
    answer.correct, grade, messages, feedback = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    create_ai_generated_draft_post(answer, feedback)
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer specified by the
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, messages to be
  #   assigned to the grading, and feedback for the draft post.
  def evaluate_answer(answer)
    question = answer.question.actable
    llm_response = evaluate_with_llm(question, answer)
    process_llm_grading_response(question, answer, llm_response)
  end

  # Calls the LLM service to evaluate the answer.
  #
  # @param [Course::Assessment::Question] question The question to be graded.
  # @param [Course::Assessment::Answer] answer The student's answer.
  # @return [Hash] The LLM's evaluation response.
  def evaluate_with_llm(question, answer)
    default_output = default_llm_output(question)
    return default_output if skip_llm_evaluation?

    formatted_user_prompt = self.class.user_prompt.format(
      question_title: question.title,
      question_description: question.description,
      rubric_categories: format_rubric_categories(question),
      answer_text: answer.answer_text
    )
    messages = [
      { role: 'system', content: self.class.system_prompt },
      { role: 'user', content: formatted_user_prompt }
    ]
    response = LANGCHAIN_OPENAI.chat(
      messages: messages,
      response_format: { type: 'json_object' }
    ).completion
    parse_llm_response(response, default_output)
  end

  # Formats rubric categories for inclusion in the LLM prompt
  # @param [Course::Assessment::Question::TextResponse] question The question containing rubric categories
  # @return [String] Formatted string representation of rubric categories and criteria
  def format_rubric_categories(question)
    question.categories.map do |category|
      criterions = category.criterions.map do |criterion|
        "- [Grade: #{criterion.grade}, Criterion ID: #{criterion.id}]: #{criterion.explanation}"
      end
      <<~CATEGORY
        Category ID: #{category.id}
        Name: #{category.name}
        Criteria:
        #{criterions.join("\n")}
      CATEGORY
    end.join("\n\n")
  end

  # Parses LLM response with retry logic for handling parsing failures
  # @param [String] response The raw LLM response to parse
  # @param [Hash] default_output The default grading output to return on failure
  # @return [Hash] The parsed response as a structured hash
  def parse_llm_response(response, default_output)
    attempt = 0
    output = response
    begin
      self.class.output_parser.parse(output)
    rescue Langchain::OutputParsers::OutputParserException
      attempt += 1
      return default_output if attempt > MAX_RETRY

      fix_parser = Langchain::OutputParsers::OutputFixingParser.from_llm(
        llm: LANGCHAIN_OPENAI,
        parser: self.class.output_parser
      )
      output = fix_parser.parse(output)
      retry
    end
  end

  # Determines if LLM evaluation should be skipped for this answer
  # @return [Boolean] true if evaluation should be skipped, false otherwise
  def skip_llm_evaluation?
    false
  end

  # Processes the LLM response into grades and feedback, and updates the answer.
  # @param [Course::Assessment::Question] question The question to be graded.
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer to update.
  # @param [Hash] llm_response The parsed LLM response containing grading information
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, and feedback messages.
  def process_llm_grading_response(question, answer, llm_response)
    return default_grading_result unless valid_llm_response?(llm_response)

    category_grades = process_category_grades(question, llm_response)

    # For rubric-based questions, update the answer's selections and grade to database
    update_answer_selections(answer, category_grades)
    answer_grade = category_grades.sum { |cg| cg[:grade].to_i }
    answer.grade = answer_grade

    # Currently no support for correctness in rubric-based questions
    [true, answer_grade, ['success'], llm_response['overall_feedback']]
  end

  # Checks if the LLM response has the expected structure for processing
  # @param [Hash] llm_response The response to validate
  # @return [Boolean] true if response is valid, false otherwise
  def valid_llm_response?(llm_response)
    llm_response.is_a?(Hash) &&
      llm_response['category_grades'].is_a?(Array) &&
      !llm_response['category_grades'].empty?
  end

  # Processes category grades from LLM response into a structured format
  # @param [Course::Assessment::Question] question The question to be graded.
  # @param [Hash] llm_response The parsed LLM response with category grades
  # @return [Array<Hash>] Array of processed category grades.
  def process_category_grades(question, llm_response)
    llm_response['category_grades'].map do |category_grade|
      category_id = category_grade['category_id']
      grade = category_grade['grade'].to_i
      explanation = category_grade['explanation']

      category = question.categories.find { |c| c.id == category_id }
      next nil unless category

      criterion = category.criterions.find { |c| c.grade == grade }

      {
        category_id: category_id,
        criterion_id: criterion&.id,
        grade: grade,
        explanation: explanation
      }
    end.compact
  end

  # Updates the answer's selections based on the graded categories.
  #
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer to update.
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [void]
  def update_answer_selections(answer, category_grades)
    # Ensure selections exist for all categories
    if answer.selections.empty?
      answer.create_category_grade_instances
      answer.reload
    end

    params = {
      selections_attributes: category_grades.map do |grade_info|
        selection = answer.selections.find { |s| s.category_id == grade_info[:category_id] }
        next unless selection

        {
          id: selection.id,
          criterion_id: grade_info[:criterion_id],
          grade: grade_info[:grade],
          explanation: grade_info[:explanation]
        }
      end.compact
    }
    answer.assign_params(params)
  end

  # Creates AI-generated draft feedback post for the answer
  # @param [Course::Assessment::Answer] answer The answer to create the post for
  # @param [String] feedback The feedback text to include in the post
  # @return [void]
  def create_ai_generated_draft_post(answer, feedback)
    submission_question = answer.submission.submission_questions.find_by(question_id: answer.question_id)
    return unless submission_question

    post = submission_question.posts.build(
      creator: User.system,
      updater: User.system,
      text: feedback,
      is_ai_generated: true,
      workflow_state: 'draft',
      title: answer.submission.assessment.title
    )
    submission_question.class.transaction do
      if submission_question.posts.length > 1
        post.parent = submission_question.posts.ordered_topologically.flatten.select(&:id).last
      end
      post.save!
      submission_question.save!
    end
  end

  # Returns a default grading result when processing fails.
  #
  # @return [Array] The default grading result.
  def default_grading_result
    [nil, nil, ['error'], 'The response could not be automatically evaluated.']
  end

  # Default grading result when LLM evaluation is skipped
  # @param [Course::Assessment::Question::TextResponse] question The question being evaluated
  # @return [Hash] Default hash with empty category grades and feedback
  def default_llm_output(question)
    {
      'category_grades' => question.categories.map do |category|
        { 'category_id' => category.id, 'grade' => 0, 'criterion_id' => 0, 'explanation' => 'Not evaluated' }
      end,
      'overall_feedback' => 'The response could not be automatically evaluated.'
    }
  end
end
