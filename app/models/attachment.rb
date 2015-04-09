class Attachment < ActiveRecord::Base
  stampable

  belongs_to :creator, class_name: User.name
  belongs_to :attachable, polymorphic: true

  mount_uploader :file_upload, FileUploader
end
