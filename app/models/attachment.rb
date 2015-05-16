class Attachment < ActiveRecord::Base
  stampable
  mount_uploader :file_upload, FileUploader

  belongs_to :creator, class_name: User.name
  belongs_to :attachable, polymorphic: true
end
