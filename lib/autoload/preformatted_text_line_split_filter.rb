# frozen_string_literal: true
class PreformattedTextLineSplitFilter < HTML::Pipeline::Filter
  # The regex for splitting input by newlines.
  NEWLINE_REGEX = /\r\n|\r|\n/.freeze

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

    lines.each do |line|
      pre.add_previous_sibling(build_line_content_tag(line))
    end
    pre.remove
  end

  # Builds a tag for one line of the output.
  #
  # @param [String] line_content The HTML markup comprising the current line.
  # @param [Hash] container_attributes The attributes of the container +pre+ tag being replaced.
  # @return [Nokogiri::XML::Element] The tag representing the line.
  def build_line_content_tag(line_content)
    line_pre = Nokogiri::XML::Element.new('pre', doc)
    line_code = Nokogiri::XML::Element.new('code', doc)
    line_pre.add_child(line_code)
    line_code.inner_html = line_content

    line_pre
  end
end
