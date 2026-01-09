# frozen_string_literal: true
# rubocop:disable Metrics/ModuleLength
module ApplicationHtmlFormattersHelper
  # Constants that defines the size/lines limit of the code
  MAX_CODE_SIZE = 50 * 1024 # 50 KB
  MAX_CODE_LINES = 1000

  # Replaces the Rails sanitizer with the one configured with HTML Pipeline.
  def sanitize(text, _options = {})
    pipeline = HTML::Pipeline.new([HTML::Pipeline::SanitizationFilter], { whitelist: SANITIZATION_FILTER_WHITELIST })
    format_with_pipeline(pipeline, text)
  end

  # Sanitises and formats the given user-input string. The string is assumed to contain HTML markup.
  # Conversions may happen, depending on the transformers registered in the pipeline.
  #
  # @param [String] text The text to display
  # @return [String]
  def format_html(text)
    format_with_pipeline(DEFAULT_HTML_CONVERTING_PIPELINE, text)
  end

  def format_ckeditor_rich_text(text)
    process_ckeditor_rich_text_with_pipeline(DEFAULT_HTML_CONVERTING_PIPELINE, text)
  end

  def sanitize_ckeditor_rich_text(text)
    process_ckeditor_rich_text_with_pipeline(DEFAULT_HTML_PIPELINE, text)
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
        I18n.t('errors.code_formatter.size_too_big')
      end
    else
      sanitize_and_format_code(code, language, start_line)
    end
  end

  # Syntax highlights the given code fragment without adding line numbers.
  #
  # This filter will normalise all line endings to Unix format (\n) for use with the Rouge
  # highlighter.
  #
  # @param [String] code The code to syntax highlight.
  # @param [Coursemology::Polyglot::Language] language The language to highlight the code block
  #   with.
  def highlight_code_block(code, language = nil)
    return if code_size_exceeds_limit?(code)

    code = html_escape(code) unless code.html_safe?
    code = code.gsub(/\r\n|\r/, "\n").html_safe

    code = content_tag(:pre, lang: language ? language.rouge_lexer : nil) do
      content_tag(:code) { code }
    end

    pipeline = HTML::Pipeline.new(DEFAULT_PIPELINE.filters + [PreformattedTextLineSplitFilter],
                                  DEFAULT_CODE_PIPELINE_OPTIONS)

    format_with_pipeline(pipeline, code)
  end

  def self.build_html_pipeline(custom_options)
    pipeline = HTML::Pipeline.new([HTML::Pipeline::SanitizationFilter], custom_options)
    options = DEFAULT_PIPELINE_OPTIONS.merge(custom_options)

    HTML::Pipeline.new(pipeline.filters + DEFAULT_PIPELINE.filters, options)
  end

  private_class_method :build_html_pipeline

  private

  # List of video hosting site URLs to allow
  VIDEO_URL_WHITELIST = Regexp.union(
    /\A(?:https?:)?\/\/(?:www\.)?(?:m.)?youtube\.com\//,
    /\A(?:https?:)?\/\/(?:www\.)?youtu.be\//
  ).freeze

  OEMBED_WHITELIST_TRANSFORMER = lambda do |env|
    node, node_name = env[:node], env[:node_name]

    return if env[:is_whitelisted] || !node.element?

    return unless node_name == 'oembed'
    return unless node['url']&.match VIDEO_URL_WHITELIST

    { node_whitelist: [node] }
  end.freeze

  OEMBED_WHITELIST_CONVERTER = lambda do |env|
    node, node_name = env[:node], env[:node_name]

    return if env[:is_whitelisted] || !node.element?

    return unless node_name == 'oembed'
    return unless node['url']&.match VIDEO_URL_WHITELIST

    begin
      resource = OEmbed::Providers.get(node['url'])
      new_node = Nokogiri::HTML5.fragment(resource.html).children.first

      node.add_next_sibling(new_node)

      { node_whitelist: [node] }
    rescue OEmbed::Error, StandardError => e
      Rails.logger.error("OEmbed error for URL #{node['url']}: #{e.message}")

      # TODO: Detect this and replace with a better fallback UI on the frontend.
      fallback_link = Nokogiri::XML::Node.new('a', node.document)
      fallback_link['href'] = node['url']
      fallback_link.content = node['url']
      node.replace(fallback_link)

      { node_whitelist: [fallback_link] }
    end
  end.freeze

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
  end.freeze

  # - Allow whitelisting of base64 encoded images for HTML text.
  # TODO: Remove 'data' from whitelisted protocols once we disable Base64 encoding
  IMAGE_WHITELIST_TRANSFORMER = lambda do |env|
    node, node_name = env[:node], env[:node_name]

    return if env[:is_whitelisted] || !node.element?

    return unless node_name == 'img'
    return node.unlink unless node['src']

    Sanitize.node!(node, elements: ['img'],
                         protocols: ['http', 'https', 'data', :relative],
                         attributes: { 'img' => ['src', 'style'] },
                         css: { properties: ['height', 'width'] })

    { node_whitelist: [node] }
  end.freeze

  # SanitizationFilter Custom Options
  # See https://github.com/gjtorikian/html-pipeline#2-how-do-i-customize-an-allowlist-for-sanitizationfilters
  SANITIZATION_FILTER_WHITELIST = begin
    list = HTML::Pipeline::SanitizationFilter::ALLOWLIST.deep_dup
    list[:remove_contents] = ['style']
    list[:elements] |= ['span', 'font', 'u', 'colgroup', 'col']
    list[:attributes][:all] |= ['style']
    list[:attributes]['font'] = ['face']
    list[:attributes]['table'] = ['class']
    list[:attributes]['code'] = ['class']
    list[:attributes]['figure'] = ['class']
    list[:css] = { properties: [
      'background-color', 'color', 'font-family', 'margin',
      'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'text-align',
      'width', 'list-style-type'
    ] }
    list[:transformers] |= [VIDEO_WHITELIST_TRANSFORMER, IMAGE_WHITELIST_TRANSFORMER].freeze
    list
  end.freeze

  DEFAULT_PIPELINE_OPTIONS = {
    scope: 'codehilite',
    replace_br: true
  }.freeze

  DEFAULT_CODE_PIPELINE_OPTIONS = DEFAULT_PIPELINE_OPTIONS.merge(css_table_class: 'table').freeze

  # The default pipeline, used by both text and HTML pipelines.
  DEFAULT_PIPELINE = HTML::Pipeline.new(
    [HTML::Pipeline::AutolinkFilter, HTML::Pipeline::SyntaxHighlightFilter],
    DEFAULT_PIPELINE_OPTIONS
  )

  # The default HTML pipeline that sanitises an HTML.
  DEFAULT_HTML_PIPELINE = begin
    whitelist = SANITIZATION_FILTER_WHITELIST.deep_dup
    whitelist[:transformers].prepend OEMBED_WHITELIST_TRANSFORMER

    build_html_pipeline({ whitelist: whitelist })
  end

  # The default HTML pipeline that sanitises AND converts certain HTML markups for display/formatting purposes.
  # This pipeline is generally NOT used for saving to the database.
  DEFAULT_HTML_CONVERTING_PIPELINE = begin
    whitelist = SANITIZATION_FILTER_WHITELIST.deep_dup
    whitelist[:transformers].prepend OEMBED_WHITELIST_CONVERTER

    build_html_pipeline({ whitelist: whitelist })
  end

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

  def process_ckeditor_rich_text_with_pipeline(pipeline, text)
    text_with_updated_code_tag = remove_internal_adjacent_code_tags(text)
    format_with_pipeline(pipeline, text_with_updated_code_tag).
      gsub(/<table>/, '<table class="table table-bordered">') # Add lines to tables
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

  # The Code formatter pipeline.
  #
  # @param [Integer] starting_line_number The line number of the first line, default is 1.
  # @return [HTML::Pipeline]
  def default_code_pipeline(starting_line_number = 1)
    HTML::Pipeline.new(DEFAULT_PIPELINE.filters + [PreformattedTextLineNumbersFilter],
                       DEFAULT_CODE_PIPELINE_OPTIONS.merge(line_start: starting_line_number))
  end

  # Removes adjacent code tags inside pre tag
  # In the past, when creating multiline codeblock using summernote,
  # it would generate <pre><code>some code </code><code> some other code</code></pre>
  # When there are multiple code tags within a pre tag, CKEditor will automatically
  # add pre tag for every code tag, which messes up the display.
  # This function will convert <pre><code></code>  <code></code></pre> into
  # <pre><code>  </code></pre>
  #
  # @param [String] text The text to be updated
  # @return [String]
  def remove_internal_adjacent_code_tags(text)
    return unless text

    detect_pre_tag = /<pre>([\s\S]*?)<\/pre>/
    text.gsub(detect_pre_tag) do |match|
      # Remove adjacent code tag (eg </code>  <code>) in the pre tag.
      match.gsub(/(?:<\/code>(.*?)<code.*?>)/, '\\1')
    end
  end
end
# rubocop:enable Metrics/ModuleLength
