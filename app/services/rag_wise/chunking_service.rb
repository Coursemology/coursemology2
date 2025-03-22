# frozen_string_literal: true
class RagWise::ChunkingService
  def initialize(text: nil, file: nil, file_name: nil)
    raise ArgumentError, 'Either text or file must be provided' if text.nil? && file.nil?

    if file
      @file = file
      @file_type = File.extname(file_name).downcase
    else
      @text = text.gsub(/\s+/, ' ').strip
    end
  end

  def file_chunking
    text = case @file_type
           when '.pdf'
             reader = PDF::Reader.new(@file.path)
             reader.pages.map(&:text).join("\n\n")
           when '.txt'
             File.read(@file.path)
           when '.docx'
             doc = Docx::Document.open(@file.path)
             doc.paragraphs.map(&:text).join("\n\n")
           when '.ipynb'
             parse_ipynb(@file.path)
           else
             raise "Unsupported file type: #{@file_type}"
           end

    @text = text.gsub(/\s+/, ' ').strip
    text_chunking
  end

  def text_chunking
    chunks = Langchain::Chunker::RecursiveText.new(@text,
                                                   chunk_size: 800, chunk_overlap: 160,
                                                   separators: ["\n\n", "\n", ' ', '']).chunks
    chunks.map(&:text)
  end

  private

  def parse_ipynb(file_path)
    notebook = JSON.parse(File.read(file_path))

    notebook['cells'].
      select { |cell| ['markdown', 'code', 'raw'].include?(cell['cell_type']) }.
      map { |cell| cell['source'].join }.
      join("\n\n")
  end
end
