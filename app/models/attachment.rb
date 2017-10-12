# frozen_string_literal: true
class Attachment < ApplicationRecord
  TEMPORARY_FILE_PREFIX = 'attachment'.freeze

  mount_uploader :file_upload, FileUploader

  has_many :attachment_references, inverse_of: :attachment, dependent: :destroy

  # @!attribute [r] url
  #   The URL to the attachment contents.
  #
  # @!attribute [r] path
  #   The path to the attachment contents.
  delegate :url, :path, to: :file_upload

  class << self
    # This is for supporting `find_or_initialize_by(file: file)`. It calculates the SHA256 hash
    # of the file and returns the attachment which has the same hash. A new attachment will be
    # built if no record matches the hash.
    #
    # @param [Hash] attributes The hash attributes with the file.
    # @return [Attachment] The attachment which contains the file.
    def find_or_initialize_by(attributes, &block)
      file = attributes.delete(:file)
      return super unless file

      attributes[:name] = file_digest(file)
      find_by(attributes) || new(attributes.reverse_merge(file_upload: file), &block)
    end

    # Supports `find_or_create_by(file: file)`. Similar to +find_or_initialize_by+, it will try
    # to return an attachment with the same hash, otherwise, a new attachment is created.
    #
    # @param [Hash] attributes The hash attributes with the file.
    # @return [Attachment] The attachment which contains the file.
    def find_or_create_by(attributes, &block)
      result = find_or_initialize_by(attributes, &block)
      result.save! unless result.persisted?
      result
    end

    private

    # Get the SHA256 hash of the file.
    #
    # @param [File|ActionDispatch::Http::UploadedFile] The uploaded file.
    # @return [String] the hash digest.
    def file_digest(file)
      # Get the actual file by #tempfile if the file is an `ActionDispatch::Http::UploadedFile`.
      Digest::SHA256.file(file.try(:tempfile) || file).hexdigest
    end
  end

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
