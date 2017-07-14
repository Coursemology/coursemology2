# frozen_string_literal: true
class PreformattedTextLineSplitFilter < HTML::Pipeline::Filter
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

    pre.add_previous_sibling(lines.join("\n"))
    pre.remove
  end
end
