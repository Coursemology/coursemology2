# frozen_string_literal: true
class Rag::ChunkingService
  def initialize(text: nil, file: nil)
    raise ArgumentError, 'Either text or file must be provided' if text.nil? && file.nil?

    if file
      @file = file
      @file_type = File.extname(file.path).downcase
    else
      @text = text.gsub(/\s+/, ' ').strip
    end
  end

  def file_chunking
    if @file_type == '.pdf'
      reader = PDF::Reader.new(@file.path)
      text = reader.pages.map(&:text).join(' ')
    elsif @file_type == '.txt'
      text = File.read(@file.path)
    else
      raise "Unsupported file type: #{@file_type}"
    end
    @text = text.gsub(/\s+/, ' ').strip
    fixed_size_chunk_text(500, 100)
  end

  def text_chunking
    fixed_size_chunk_text(500, 100)
  end

  private

  def fixed_size_chunk_text(chunk_size, overlap_size)
    chunks = []
    start = 0
    ending = 0
    while ending < @text.length
      # Define the chunk with overlap
      chunk = @text[start, chunk_size]
      chunks << chunk
      ending = start + chunk_size
      # Move the starting position forward, keeping the overlap
      start += (chunk_size - overlap_size)
    end
    chunks
  end
end
