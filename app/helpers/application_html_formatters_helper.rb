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

  # List of video hosting site URLs to allow
  VIDEO_URL_WHITELIST = Regexp.union(
    /\A(?:https?:)?\/\/(?:www\.)?youtube\.com\//,
    /\A(?:https?:)?\/\/(?:www\.)?youtu.be\//,
    /\A(?:https?:)?\/\/(?:www\.)?vimeo\.com\//,
    /\A(?:https?:)?\/\/(?:www\.)?vine\.co\//,
    /\A(?:https?:)?\/\/(?:www\.)?instagram\.com\//,
    /\A(?:https?:)?\/\/(?:www\.)?dailymotion\.com\//,
    /\A(?:https?:)?\/\/(?:www\.)?youku\.com\//
  )

  # Transformer to whitelist iframes containing embedded video content
  VIDEO_WHITELIST_TRANSFORMER = lambda do |env|
    node, node_name = env[:node], env[:node_name]

    return if env[:is_whitelisted] || !node.element?

    return unless node_name == 'iframe'
    return unless node['src']&.match VIDEO_URL_WHITELIST

    Sanitize.node!(node, elements: ['iframe'],
                         attributes: {
                           'iframe' => ['allowfullscreen', 'frameborder', 'height', 'src', 'width']
                         })

    { node_whitelist: [node] }
  end

  # SanitizationFilter Custom Options
  #
  # - Allow whitelisting of base64 encoded images for HTML text.
  # Link: https://github.com/jch/html-pipeline#2-how-do-i-customize-a-whitelist-for-sanitizationfilters
  # TODO: Remove 'data' once we disable Base64 encoding
  SANITIZATION_FILTER_WHITELIST = begin
    list = HTML::Pipeline::SanitizationFilter::WHITELIST
    list[:protocols]['img']['src'] |= ['data']
    list[:elements] |= ['span', 'font']
    list[:attributes][:all] |= ['style']
    list[:attributes]['font'] = ['face']
    list[:attributes]['table'] = ['class']
    list[:css] = { properties: [
      'background-color', 'color', 'float', 'font-family', 'height', 'margin',
      'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'text-align', 'width'
    ] }
    list[:transformers] |= [VIDEO_WHITELIST_TRANSFORMER]
    list
  end

  # The HTML sanitizer options to use.
  HTMLSanitizerOptions = {
    whitelist: SANITIZATION_FILTER_WHITELIST
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

  # Constants that defines the size/lines limit of the code
  MAX_CODE_SIZE = 50 * 1024 # 50 KB
  MAX_CODE_LINES = 1000

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
  # @param [Integer] start_line The line number of the first line, default is 1. This
  #   should be provided if the code fragment does not start on the first line.
  def format_code_block(code, language = nil, start_line = 1)
    if code_size_exceeds_limit?(code)
      content_tag(:div, class: 'alert alert-warning') do
        I18n.t('layouts.code_formatter.size_too_big')
      end
    else
      sanitize_and_format_code(code, language, start_line)
    end
  end

  private

  # Test if the given code exceeds the size or line limit.
  def code_size_exceeds_limit?(code)
    code && (code.bytesize > MAX_CODE_SIZE || code.lines.size > MAX_CODE_LINES)
  end

  def sanitize_and_format_code(code, language, start_line)
    code = html_escape(code) unless code.html_safe?
    code = code.gsub(/\r\n|\r/, "\n").html_safe
    code = content_tag(:pre, lang: language ? language.rouge_lexer : nil) do
      content_tag(:code) do
        code
      end
    end

    format_with_pipeline(default_code_pipeline(start_line), code)
  end

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
