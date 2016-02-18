# frozen_string_literal: true
module Extensions::Attachable::ActiveRecord::Base
  module ClassMethods
    # This function should be declared in model, to it have attachments.
    def has_many_attachments # rubocop:disable Style/PredicateName
      has_many :attachments, as: :attachable, class_name: "::#{Attachment.name}",
                             inverse_of: :attachable, dependent: :destroy, autosave: true

      define_method(:files=) do |files|
        files.each do |file|
          attachments.build.file_upload = file
        end
      end
    end

    def has_one_attachment # rubocop:disable Style/PredicateName
      include SingularInstanceMethods

      validates :attachments, length: { maximum: 1 }

      has_many :attachments, as: :attachable, class_name: "::#{Attachment.name}",
                             inverse_of: :attachable, dependent: :destroy, autosave: true
    end
  end

  module SingularInstanceMethods
    ATTACHMENT_ATTRIBUTE = 'attachment'.freeze

    def attachment
      attachments.take
    end

    def attachment=(attachment)
      return self.attachment if self.attachment == attachment
      attribute_will_change!(ATTACHMENT_ATTRIBUTE)
      attachments.clear
      attachments << attachment if attachment
    end

    def build_attachment(attributes = {})
      attribute_will_change!(ATTACHMENT_ATTRIBUTE)
      attachments.clear
      attachments.build(attributes)
    end

    def attachment_changed?
      changed.include?('attachment'.freeze)
    end

    def file=(file)
      if file
        build_attachment(file_upload: file)
      else
        return nil if attachment.nil?
        attribute_will_change!(ATTACHMENT_ATTRIBUTE)
        attachments.clear
      end
    end
  end
end
