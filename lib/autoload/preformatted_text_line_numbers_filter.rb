# frozen_string_literal: true
class PreformattedTextLineNumbersFilter < HTML::Pipeline::Filter
  # The regex for splitting input by newlines.
  NEWLINE_REGEX = /\r\n|\r|\n/

  # Adds a line number before the code block.
  # Takes a :line_start option which specifies the start line number, default is 1.
  def call
    doc.search('pre').each do |pre|
      process_pre_tag(pre)
    end

    doc
  end

  private

  # Processes a pre tag in the document fragment.
  #
  # @param [Nokogiri::XML::Node] pre The +pre+ tag being processed.
  def process_pre_tag(pre)
    content_tag = pre.children.filter('code').first || pre
    lines = content_tag.inner_html.split(NEWLINE_REGEX, -1)

    pre.add_next_sibling(build_table_tag(lines, pre))
    pre.remove
  end

  # Builds the table for the code block.
  #
  # @param [Array<String>] lines The lines of code comprising the code block.
  # @param [Nokogiri::XML::Node] pre The +pre+ tag being processed.
  def build_table_tag(lines, pre)
    table = Nokogiri::XML::Element.new('table', doc)
    table['class'] = [pre['class'], context[:css_class] || 'highlight', context[:css_table_class]].
                     compact.join(' ')

    line_start = context[:line_start] || 1
    lines.each_with_index do |line, i|
      tr = build_line_tag(i + line_start, line, pre.attributes)
      table.add_child(tr)
    end

    table
  end

  # Builds a tag for one line of the output.
  #
  # @param [Integer] line_number The line number being build
  # @param [String] line_content The HTML markup comprising the current line.
  # @param [Hash] container_attributes The attributes of the container +pre+ tag being replaced.
  # @return [Nokogiri::XML::Element] The tag representing the line.
  def build_line_tag(line_number, line_content, container_attributes)
    tr = Nokogiri::XML::Element.new('tr', doc)

    tr.add_child(build_line_number_tag(line_number))
    tr.add_child(build_line_content_tag(line_content, container_attributes))

    tr
  end

  # Builds a tag for one line number.
  #
  # @param [Integer] line_number The line number being build
  # @return [Nokogiri::XML::Element] The tag representing the line.
  def build_line_number_tag(line_number)
    result = Nokogiri::XML::Element.new('td', doc)
    result['class'] = 'line-number'
    result['data-line-number'] = line_number

    result
  end

  # Builds a tag for one line of the output.
  #
  # @param [String] line_content The HTML markup comprising the current line.
  # @param [Hash] container_attributes The attributes of the container +pre+ tag being replaced.
  # @return [Nokogiri::XML::Element] The tag representing the line.
  def build_line_content_tag(line_content, container_attributes)
    result = Nokogiri::XML::Element.new('td', doc)
    result['class'] = 'line-content'

    line_pre = Nokogiri::XML::Element.new('pre', doc)
    result.add_child(line_pre)
    container_attributes.each { |key, value| line_pre.set_attribute(key, value) }

    line_code = Nokogiri::XML::Element.new('code', doc)
    line_pre.add_child(line_code)
    line_code.inner_html = line_content

    result
  end
end
