# frozen_string_literal: true
class Attachment < ActiveRecord::Base
  TEMPORARY_FILE_PREFIX = 'attachment'.freeze

  mount_uploader :file_upload, FileUploader

  belongs_to :attachable, polymorphic: true

  # Opens the attachment for reading as a stream. The options are the same as those taken by
  # +IO.new+
  #
  # This is read-only, because the attachment might not be stored on local disk.
  #
  # @option opt [Boolean] :binmode If this value is a truth value, the same as 'b'.
  # @option opt [Boolean] :textmode If this value is a truth value, the same as 't'.
  # @param [Proc] block The block to run with a reference to the stream.
  # @yieldparam [IO] stream The stream to read the attachment with.
  #
  # @return [Tempfile] When no block is provided.
  # @return The result of the block when a block is provided.
  def open(opt = {}, &block)
    return open_with_block(opt, block) if block

    open_without_block(opt)
  end

  private

  # Opens the attachment for reading as a block.
  #
  # @param opt [Hash] The options for opening the stream with.
  # @param block [Proc] The block to receive the stream with.
  def open_with_block(opt, block)
    Tempfile.create(TEMPORARY_FILE_PREFIX, opt) do |temporary_file|
      temporary_file.write(contents)
      temporary_file.seek(0)

      block.call(temporary_file)
    end
  end

  # Opens the attachment for reading.
  #
  # @param opt [Hash] The options for opening the stream with.
  # @return [Tempfile] The temporary file opened.
  def open_without_block(opt)
    file = Tempfile.new(TEMPORARY_FILE_PREFIX, Dir.tmpdir, opt)
    file.write(contents)
    file.seek(0)
    file
  rescue
    file.close! if file
    raise
  end

  # Retrieves the contents of the attachment.
  #
  # @return [String] The contents of the attachment.
  def contents
    file_upload.read
  end
end
