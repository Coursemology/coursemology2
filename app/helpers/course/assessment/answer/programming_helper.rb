module Course::Assessment::Answer::ProgrammingHelper
  # Generates HTML with formatted code and annotations.
  #
  # @param [Course::Assessment::Answer::ProgrammingFile] programming_answer_file The programming
  #   answer file to format.
  # @param [Coursemology::Polyglot::Language] language The programming language to format the
  #   answer file with.
  # @return [String] The HTML markup for displaying the file.
  def format_programming_answer_file(programming_answer_file, language)
    code_block = format_code_block(programming_answer_file.content, language)
    insert_annotations(code_block, programming_answer_file)
  end

  # Generates the annotation cell ID for the given file and line number.
  #
  # This is the Ruby port of +fileLineAnnotationCellId+ in
  # +app/assets/javascripts/course/assessment/submission/answer/programming.js+.
  #
  # @param [Course::Assessment::Answer::ProgrammingFile] file The file which is being annotated.
  # @param [Integer] line_number The line number being annotated.
  # @return [String] The ID of the cell containing the annotation for the given file and line
  # number.
  def file_line_annotation_cell_id(file, line_number)
    "line_annotation_file_#{file.id}_line_#{line_number}_annotation"
  end

  # Get a hint message. Use the one from test_result if available, else fallback to the one from
  # the test case.
  #
  # @param [Course::Assessment::Question::ProgrammingTestCase] The test case
  # @param [Course::Assessment::Answer::ProgrammingAutoGradingTestResult] The test result
  # @return [String] The hint, or an empty string if there isn't one
  def get_hint(test_case, test_case_result)
    hint = test_case_result.messages['hint'] if test_case_result
    hint ||= test_case.hint
    hint || ''
  end

  # Get the output message for the tutors to see when grading. Use the output meta attribute if
  # available, else fallback to the failure message, error message, and finally empty string.
  #
  # @param [Course::Assessment::Answer::ProgrammingAutoGradingTestResult] The test result
  # @return [String] The output, failure message, error message or empty string
  #   if the previous 3 don't exist.
  def get_output(test_case_result)
    if test_case_result
      output = test_case_result.messages['output']
      output = test_case_result.messages['failure'] if output.blank?
      output = test_case_result.messages['error'] if output.blank?
    end
    output || ''
  end

  # If the test case type has a failed test case, return the first one.
  #
  # @param [Hash] test_cases_by_type The test cases keyed by type
  # @param [Hash] answer_test_results_hash The test results keyed by test case
  # @return [Hash] Failed test case, if any.
  def arrange_failed_test_cases_by_type(test_cases_by_type, answer_test_results_hash)
    {}.tap do |result|
      test_cases_by_type.each do |test_case_type, test_cases|
        result[test_case_type] = get_first_failed_test(test_cases, answer_test_results_hash)
      end
    end
  end

  private

  # Inserts annotations into the generated code block.
  #
  # @param [String] code_block_html The formatted code block, after the
  #   +HTML::Pipeline::RougeFilter+ and +PreformattedTextLineNumbersFilter+.
  # @param [Course::Assessment::Answer::ProgrammingFile] programming_answer_file The programming
  #   answer file to format.
  # @return [String] The HTML markup for displaying the file with annotations.
  def insert_annotations(code_block_html, programming_answer_file)
    document = Nokogiri::XML.parse(code_block_html)

    programming_answer_file.annotations.each do |annotation|
      if annotation.discussion_topic.posts.empty?
        next
      end
      insert_annotation_block(document, annotation)
    end

    document.to_html.html_safe
  end

  # Inserts an annotation into the generated code block.
  #
  # @param [Nokogiri::XML::Document] document The document containing the formatted code.
  # @param [Course::Assessment::Answer::ProgrammingFileAnnotation] annotation The annotation to
  #   display on the code block.
  def insert_annotation_block(document, annotation)
    document.search(".//td[@data-line-number='#{annotation.line}']").each do |line_number|
      line_number_row = line_number.at('..')
      line_number_cell = line_number_row.at('.//td[@class="line-number"]')

      trigger_html = render partial: 'course/assessment/answer/programming/annotation_row_trigger'
      line_number_cell.inner_html = Nokogiri::XML::DocumentFragment.parse(trigger_html)

      line_discussion_row = build_annotation_row(annotation)
      line_number_row.add_next_sibling(line_discussion_row)
    end
  end

  # Builds an annotation row for the given annotation.
  #
  # @param [Course::Assessment::Answer::ProgrammingFileAnnotation] annotation The annotation to
  #   display on the code block.
  # @return [Nokogiri::XML::Node] The node representing the annotation row.
  def build_annotation_row(annotation)
    html = render partial: 'course/assessment/answer/programming/annotation_row',
                  locals: {
                    annotation_cell_id: file_line_annotation_cell_id(annotation.file,
                                                                     annotation.line),
                    line_number: annotation.line
                  }

    line_discussion_row = Nokogiri::XML::DocumentFragment.parse(html)
    line_discussion_cell = line_discussion_row.at('.//td[@class="line-annotation"]')

    build_annotation_discussion(line_discussion_cell, annotation.discussion_topic)

    line_discussion_row
  end

  # Builds a discussion topic for the given annotation.
  #
  # @param [Nokogiri::XML::Node] line_discussion_cell The parent element to insert the discussion
  #   topic into.
  # @param [Course::Discussion::Topic] discussion_topic The discussion topic to render.
  def build_annotation_discussion(line_discussion_cell, discussion_topic)
    html = render partial: 'course/assessment/answer/programming/annotation_topic',
                  object: discussion_topic

    line_discussion_cell.inner_html = html
  end

  # Return the first failing test case
  #
  # @param [Array] test_cases An array of test cases
  # @param [Hash] Hash of test results keyed by test case
  # @return [Course::Assessment::Question::Programming::TestCase|nil] the failed test case, nil
  #   if all tests passed
  def get_first_failed_test(test_cases, answer_test_results_hash)
    test_cases.each do |t|
      return t if answer_test_results_hash[t] && !answer_test_results_hash[t].passed?
    end
    nil
  end
end
