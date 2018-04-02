# frozen_string_literal: true
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
end
