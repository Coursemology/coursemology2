# frozen_string_literal: true
class AttachmentReference < ApplicationRecord
  include DuplicationStateTrackingConcern

  before_save :update_expires_at

  validates :attachable_type, length: { maximum: 255 }, allow_blank: true
  validates :name, length: { maximum: 255 }, allow_blank: true
  validates :name, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :attachment, presence: true

  belongs_to :attachable, polymorphic: true, inverse_of: nil, optional: true
  belongs_to :attachment, inverse_of: :attachment_references

  delegate :open, :url, :path, to: :attachment

  # Get the name from the file and then further build or find an attachment based on file's SHA256
  # hash.
  #
  # @param [File|ActionDispatch::Http::UploadedFile] The uploaded file.
  def file=(file)
    self.name = filename(file)
    self.attachment = Attachment.find_or_initialize_by(file: file)
  end

  # Return false to prevent the userstamp gem from changing the updater during duplication
  def record_userstamp
    !duplicating?
  end

  def initialize_duplicate(duplicator, other)
    self.attachable = duplicator.duplicate(other.attachable)
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    set_duplication_flag
  end

  def generate_public_url
    url(filename: name)
  end

  private

  # Infer the name of the file.
  #
  # @param [File|ActionDispatch::Http::UploadedFile] The uploaded file.
  # @return [String] The filename.
  def filename(file)
    name = if file.respond_to?(:original_filename)
             file.original_filename
           else
             File.basename(file)
           end
    Pathname.normalize_filename(name)
  end

  # Clears the expires_at if attachable is present, otherwise set the expires_at.
  def update_expires_at
    self.expires_at = if attachable
                        nil
                      else
                        1.day.from_now
                      end
  end
end
