# frozen_string_literal: true
class Attachment < ActiveRecord::Base
  mount_uploader :file_upload, FileUploader

  belongs_to :attachable, polymorphic: true
end
