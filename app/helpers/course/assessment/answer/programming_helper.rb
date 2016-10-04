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
  # @param [Hash] test_cases_by_type The test cases and their results keyed by type
  # @return [Hash] Failed test case and its result, if any
  def get_failed_test_cases_by_type(test_cases_and_results)
    {}.tap do |result|
      test_cases_and_results.each do |test_case_type, test_cases_and_results_of_type|
        result[test_case_type] = get_first_failed_test(test_cases_and_results_of_type)
      end
    end
  end

  # Organize the test cases and test results into a hash, keyed by test case type.
  # If there is no test result, the test case key points to nil.
  # nil is needed to make sure test cases are still displayed before they have a test result.
  # e.g. { 'public_test': { test_case_1: result_1, test_case_2: result_2, test_case_3: nil },
  #        'private_test': { priv_case_1: priv_result_1 },
  #        'evaluation_test': { eval_case1: eval_result_1 } }
  #
  # @param [Hash] test_cases_by_type The test cases keyed by type
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading Auto grading object
  # @return [Hash] The hash structure described above
  def get_test_cases_and_results(test_cases_by_type, auto_grading)
    answer_test_results_hash = map_answers_to_test_results(auto_grading)
    {}.tap do |result|
      test_cases_by_type.each do |test_case_type, test_cases|
        result[test_case_type] = test_cases.map do |test_case|
          [test_case, answer_test_results_hash[test_case]]
        end.to_h
      end
    end
  end

  # Return the bootstrap class for highlighting the test case row.
  #
  # @param [Course::Assessment::Answer::ProgrammingAutoGradingTestResult] test_case_result The
  #   test case result.
  # @return [Array<String>] ['bg-success', 'text-success'], ['bg-danger', 'text-danger'] or an
  # empty array if there is no test_case_result.
  def test_result_class(test_case_result)
    return [] unless test_case_result
    test_case_result.passed? ? ['bg-success', 'text-success'] : ['bg-danger', 'text-danger']
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

  # Return a hash of the first failing test case and its test result
  #
  # @param [Hash] test_cases_and_results_of_type A hash of test cases and results keyed by type
  # @return [Hash] the failed test case and result, nil if all tests passed
  def get_first_failed_test(test_cases_and_results_of_type)
    test_cases_and_results_of_type.each do |test_case, test_result|
      return [[test_case, test_result]].to_h if test_result && !test_result.passed?
    end
    nil
  end

  # Convert an AutoGrading object to hash of test results, keyed by test case
  #
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading Auto grading object
  # @return [Hash] Hash of test results, keyed by test case
  def map_answers_to_test_results(auto_grading)
    return {} unless auto_grading
    auto_grading.test_results.map { |result| [result.test_case, result] }.to_h
  end
end
