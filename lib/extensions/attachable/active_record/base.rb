# frozen_string_literal: true
module Extensions::Attachable::ActiveRecord::Base
  module ClassMethods
    # This function should be declared in model, to it have attachments.
    def has_many_attachments # rubocop:disable Style/PredicateName
      include HasManyAttachments
    end

    def has_one_attachment # rubocop:disable Style/PredicateName
      include HasOneAttachment
    end
  end

  module HasManyAttachments
    extend ActiveSupport::Concern

    included do
      has_many :attachment_references, as: :attachable, class_name: "::#{AttachmentReference.name}",
                                       inverse_of: :attachable, dependent: :destroy, autosave: true
      # Attachment references can substitute attachments, so allow access using the `attachments`
      # identifier.
      alias_method :attachments, :attachment_references
    end

    def files=(files)
      files.each do |file|
        attachment_references.build(file: file)
      end
    end
  end

  module HasOneAttachment
    extend ActiveSupport::Concern

    included do
      validates :attachment_references, length: { maximum: 1 }

      has_many :attachment_references, as: :attachable, class_name: "::#{AttachmentReference.name}",
                                       inverse_of: :attachable, dependent: :destroy, autosave: true
    end

    ATTACHMENT_ATTRIBUTE = 'attachment'.freeze

    def attachment_reference
      attachment_references.take
    end
    # Attachment references can substitute attachments, so allow access using the `attachment`
    # identifier.
    alias_method :attachment, :attachment_reference

    def attachment_reference=(attachment_reference)
      return self.attachment_reference if self.attachment_reference == attachment_reference

      attribute_will_change!(ATTACHMENT_ATTRIBUTE)
      attachment_references.clear
      attachment_references << attachment_reference if attachment_reference
    end
    alias_method :attachment=, :attachment_reference=

    def build_attachment_reference(attributes = {})
      attribute_will_change!(ATTACHMENT_ATTRIBUTE)
      attachment_references.clear
      attachment_references.build(attributes)
    end
    alias_method :build_attachment, :build_attachment_reference

    def attachment_reference_changed?
      changed.include?(ATTACHMENT_ATTRIBUTE)
    end
    alias_method :attachment_changed?, :attachment_reference_changed?

    def file=(file)
      if file
        build_attachment_reference(file: file)
      else
        return nil if attachment_reference.nil?
        attribute_will_change!(ATTACHMENT_ATTRIBUTE)
        attachment_references.clear
      end
    end
  end
end
