# frozen_string_literal: true
module Extensions::Attachable::ActiveRecord::Base
  module ClassMethods
    # This method should be declared in model, to let it have attachments.
    #
    # @param [Hash] options
    # @option options [Symbol|Array<Symbol>] :on The column which is associated with attachments,
    #   the column type should be string or text.
    #   This can be a symbol or an array of symbols.
    #   An attribute named `column_name_attachment_references` will be defined, you can override it
    #   to customise the way to retrieve the attachment_references for the specific column.
    # @example Has many attachments on a column
    #   has_many_attachments on: :description #=> description is associated with the attachments
    #   of the model, updating description will result in attachments changing.
    #
    #   You can further implement `description_attachment_references_removed` reader in this case to
    #   override the default method. The attachment_references ids returned by it will be removed.
    #
    #   For deletion of attachments, it is necessary for the model to implement the
    #   +:destroy_attachment+ CanCanCan permission on the +attachable+ object.
    def has_many_attachments(options = {}) # rubocop:disable Style/PredicateName
      include HasManyAttachments

      if options[:on]
        self.attachable_columns = Array(options[:on])
        before_save :update_attachment_references

        HasManyAttachments.define_attachment_references_readers(attachable_columns)
      end
    end

    def has_one_attachment # rubocop:disable Style/PredicateName
      include HasOneAttachment
    end
  end

  module HasManyAttachments
    extend ActiveSupport::Concern

    included do
      class_attribute :attachable_columns
      self.attachable_columns ||= []

      has_many :attachment_references, as: :attachable, class_name: "::#{AttachmentReference.name}",
                                       inverse_of: :attachable, dependent: :destroy, autosave: true
      # Attachment references can substitute attachments, so allow access using the `attachments`
      # identifier.
      alias_method :attachments, :attachment_references
    end

    ATTACHMENT_REMOVED_SUFFIX = '_attachment_references_removed'.freeze

    def self.define_attachment_references_readers(attachable_columns)
      attachable_columns.each do |column|
        method_name = "#{column}#{ATTACHMENT_REMOVED_SUFFIX}"
        next if method_defined?(method_name)

        # Define a reader `#{column_name}_attachment_references_removed` to allow clients
        # to implement logic when attachments are removed.
        # This method returns the attachment_reference_ids of attachments that are removed,
        # by comparing `column` and `column_was` (from ActiveRecord::Dirty).
        define_method(method_name) do
          return [] unless send("#{column}_changed?")
          ids_was = parse_attachment_reference_ids_from_content(send("#{column}_was"))
          ids = parse_attachment_reference_ids_from_content(send(column))
          ids_was - ids
        end
      end
    end

    def files=(files)
      files.each do |file|
        attachment_references.build(file: file)
      end
    end

    private

    # Delete the attachment references which are removed in this update.
    def update_attachment_references
      return if attachment_references.empty?

      ids = attachment_reference_ids_removed
      attachment_references.each do |attachment_reference|
        attachment_reference.mark_for_destruction if ids.include?(attachment_reference.id)
      end
    end

    # Find all attachment_reference ids removed in the columns specified.
    #
    # @return [Array<Integer>]
    def attachment_reference_ids_removed
      attachment_reference_ids = []
      self.class.attachable_columns.each do |column|
        attachment_reference_ids += send("#{column}#{ATTACHMENT_REMOVED_SUFFIX}")
      end

      attachment_reference_ids
    end

    # Parse all attachment_reference ids in the content.
    #
    # @param [String] content The content which associated with the attachments.
    # @return [Array<Integer>] the ids of the attachment references in the content.
    def parse_attachment_reference_ids_from_content(content)
      ids = []
      doc = Nokogiri::HTML(content)
      doc.css('img').each do |image|
        id = parse_attachment_reference_id_from_url(image['src'])
        ids << id if id
      end

      ids
    end

    # Regex for filtering UUIDs.
    ATTACHMENT_ID_REGEX = /\/attachments\/([0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12})$/
    # Parse attachment_reference from the given url.
    #
    # @param [String] url The url.
    # @return [Integer|nil] the id of the attachment references in the url, nil will be returned
    #   if the url is not a valid attachment url.
    def parse_attachment_reference_id_from_url(url)
      # TODO: Attachments from a third party domain with the same path should not be returned.
      result = url.match(ATTACHMENT_ID_REGEX)
      result ? result[1] : nil
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
