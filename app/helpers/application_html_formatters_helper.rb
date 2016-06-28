# frozen_string_literal: true
module ApplicationHTMLFormattersHelper
  DefaultPipelineOptions = {
    css_class: 'codehilite',
    replace_br: true
  }.freeze

  # The default pipeline, used by both text and HTML pipelines.
  DefaultPipeline = HTML::Pipeline.new([
                                         HTML::Pipeline::AutolinkFilter,
                                         HTML::Pipeline::RougeFilter
                                       ], DefaultPipelineOptions)

  # The HTML sanitizer options to use.
  HTMLSanitizerOptions = {
  }.freeze

  # The HTML sanitizer to use.
  HTMLSanitizerPipeline = HTML::Pipeline.new([HTML::Pipeline::SanitizationFilter],
                                             HTMLSanitizerOptions)

  # The default HTML pipeline options.
  DefaultHTMLPipelineOptions = DefaultPipelineOptions.merge(HTMLSanitizerOptions).freeze

  # The default HTML pipeline.
  DefaultHTMLPipeline = HTML::Pipeline.new(HTMLSanitizerPipeline.filters +
                                           DefaultPipeline.filters,
                                           DefaultHTMLPipelineOptions)

  # The Code formatter options to use.
  DefaultCodePipelineOptions = DefaultPipelineOptions.merge(css_table_class: 'table').freeze

  # The Code formatter pipeline.
  #
  # @param [Integer] starting_line_number The line number of the first line, default is 1.
  # @return [HTML::Pipeline]
  def default_code_pipeline(starting_line_number = 1)
    HTML::Pipeline.new(DefaultPipeline.filters +
                         [PreformattedTextLineNumbersFilter],
                       DefaultCodePipelineOptions.merge(line_start: starting_line_number))
  end

  # Replaces the Rails sanitizer with the one configured with HTML Pipeline.
  def sanitize(text)
    format_with_pipeline(HTMLSanitizerPipeline, text)
  end

  # Replaces the Rails simple_format to escape HTML.
  #
  # @return [String]
  def simple_format(text, *args)
    text = html_escape(text) unless text.html_safe?
    args.unshift(text)
    super(*args)
  end

  # Sanitises and formats the given user-input string. The string is assumed to contain HTML markup.
  #
  # @param [String] text The text to display
  # @return [String]
  def format_html(text)
    format_with_pipeline(DefaultHTMLPipeline, text)
  end

  # Syntax highlights and adds lines numbers to the given code fragment.
  #
  # This filter will normalise all line endings to Unix format (\n) for use with the Rouge
  # highlighter.
  #
  # @param [String] code The code to syntax highlight.
  # @param [Coursemology::Polyglot::Language] language The language to highlight the code block
  #   with.
  # @param [Integer] starting_line_number The line number of the first line, default is 1. This
  #   should be provided if the code fragment does not start on the first line.
  def format_code_block(code, language = nil, starting_line_number = 1)
    code = html_escape(code) unless code.html_safe?
    code = code.gsub(/\r\n|\r/, "\n")
    code = content_tag(:pre, lang: language ? language.rouge_lexer : nil) do
      content_tag(:code) do
        code
      end
    end

    format_with_pipeline(default_code_pipeline(starting_line_number), code)
  end

  private

  # Filters the given text through the given pipeline.
  #
  # This inserts a dummy root node to conform with html-pipeline needing a root element.
  #
  # @param [HTML::Pipeline] pipeline The pipeline to filter with.
  # @param [String] text The text to filter.
  # @return [String]
  def format_with_pipeline(pipeline, text)
    pipeline.to_document("<div>#{text}</div>").child.inner_html.html_safe
  end
end
