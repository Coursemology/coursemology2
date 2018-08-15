# frozen_string_literal: true
module Extensions::Attachable::ActiveRecord::Base
  module ClassMethods
    # Declaration for a model having many attachments. This declaration supports two possible ways
    # of association: direct association, or association via a column.
    #
    #   (i) Direct association denotes an object having multiple attachments (eg. Assessement has
    #   multiple files attached to the object itself)
    #
    #   (ii) Association via a column is meant to support the embedding of attachment images
    #   within columns containing HTML markup.
    #
    # For deletion of attachments, it is necessary for the model to implement the
    # +:destroy_attachment+ CanCanCan permission on the +attachable+ object.
    #
    # For (ii), the `has_many_attachments on: :column` declaration provides some additional
    # methods and logic:
    #
    #   1. +column_name_attachment_reference_ids+: Access ids of attachment_references within the
    #   column. This is done by using a HTML parser for the column to locate img tags with the
    #   attribute +data-attachment-reference-id+.
    #
    #   2. +column_name_attachment_references_change+: Similar to +ActiveModel::Dirty+, this
    #   returns an array of old and current attachment_reference_ids. This is to allow custom
    #   callback logic to be implemented by the model. The return value follows the following
    #   shape:
    #   [[Old ids on column], [Current ids on column]]
    #
    #   3. +column_name_for_email+: Returns a rich-text string to be used when sending emails.
    #   This is to allow models to send rich text emails with attachments embedded in them.
    #   This is because emails could be read on a different machine, which might not have
    #   access to the Coursemology server.
    #
    #   4. +update_attachment_references+ (before_save callback): This handles changes in
    #   attachment_references. This includes assocating new attachment_references with the
    #   current object, validating the current set of attachment_references (see
    #   +get_valid_attachment_reference+), and marking removed attachment_references for
    #   destruction (which will be deleted).
    #   This facilitates the WYSIWYG editor to insert images into the content by creating an
    #   attachment_reference first (with +nil+ attachable), then correctly associate the
    #   attachment_reference when the model is saved.
    #
    # @param [Hash] options
    # @option options [Symbol|Array<Symbol>] :on The column associated with attachments, note that
    #   the column type should be string or text.
    #   This can be a symbol or an array of symbols.
    #   An attribute named `column_name_attachment_references` will be defined, you can override it
    #   to customise the way to retrieve the attachment_references for the specific column.
    # @example Has many attachments on a column
    #   has_many_attachments on: :description #=> description contains HTML markup and images
    #   associated with the attachments. Updating description will result in attachments changing.
    #
    #   To change the provided logic, you can override `description_attachment_references_changes`.
    def has_many_attachments(options = {}) # rubocop:disable Naming/PredicateName
      include HasManyAttachments

      return unless options[:on]
      self.attachable_columns = Array(options[:on])
      before_save :update_attachment_references

      HasManyAttachments.define_attachment_references_readers(attachable_columns)
    end

    def has_one_attachment # rubocop:disable Naming/PredicateName
      include HasOneAttachment
    end
  end

  module HasManyAttachments
    extend ActiveSupport::Concern

    included do
      class_attribute :attachable_columns
      self.attachable_columns ||= []

      has_many :attachment_references, as: :attachable, class_name: "::#{AttachmentReference.name}",
                                       inverse_of: :attachable, dependent: :destroy, autosave: true,
                                       after_add: :mark_attachments_as_changed
      # Attachment references can substitute attachments, so allow access using the `attachments`
      # identifier.
      alias_method :attachments, :attachment_references

      def attachments_changed?
        !!@attachments_changed
      end

      private

      def mark_attachments_as_changed(*)
        @attachments_changed = true
      end
    end

    ATTACHMENT_REFERENCE_SUFFIX = '_attachment_reference_ids'
    ATTACHMENT_CHANGED_SUFFIX = '_attachment_references_change'
    FOR_EMAIL_SUFFIX = '_to_email'

    def self.define_attachment_references_readers(attachable_columns)
      attachable_columns.each do |column|
        email_method_name = "#{column}#{FOR_EMAIL_SUFFIX}"
        unless method_defined?(email_method_name)

          # Define a method to get the content with attachment urls for the given content.
          # This is to be used for emails.
          define_method(email_method_name) do
            prepare_content_for_email(send(column))
          end
        end

        reader_method_name = "#{column}#{ATTACHMENT_REFERENCE_SUFFIX}"
        unless method_defined?(reader_method_name)

          # Define a reader to get attachment_reference_ids within the given content
          define_method(reader_method_name) do
            parse_attachment_reference_uuids_from_content(send(column))
          end
        end

        changed_method_name = "#{column}#{ATTACHMENT_CHANGED_SUFFIX}"
        next if method_defined?(changed_method_name)

        # Define a reader `#{column_name}_attachment_references_change` to allow clients
        # to implement logic when attachments have changed. This method returns previous
        # attachment_reference_ids and current_attachment_reference_ids by comparing
        # `column` and `column_was` (from ActiveRecord::Dirty).
        #
        # @return [Array<Array<String>>] Array with 2 elements:
        #   i) previous set of attachment_reference_ids
        #   ii) current set of attachment_reference_ids
        define_method(changed_method_name) do
          return [] unless send("#{column}_changed?")
          attachment_ids_was = parse_attachment_reference_uuids_from_content(send("#{column}_was"))
          attachment_ids = parse_and_validate_attachment_reference_uuids_from_content(send(column))

          [attachment_ids_was, attachment_ids]
        end
      end
    end

    def files=(files)
      files.each do |file|
        attachment_references.build(file: file)
      end
    end

    private

    # Update attachment_references which are added or removed in this update. This also
    # associates all attachment_references that have no attachable yet.
    #
    # +attachment_reference_id_changes+ is called, which validates the current
    # attachment_references.
    def update_attachment_references
      changes = attachment_reference_id_changes
      added_ids, removed_ids = changes[1] - changes[0], changes[0] - changes[1]

      attachment_references.each do |attachment_reference|
        attachment_reference.mark_for_destruction if removed_ids.include?(attachment_reference.id)
      end
      added_ids.each do |attachment_reference_id|
        attachment_references << AttachmentReference.find(attachment_reference_id)
      end
    end

    # Find all changes in attachment_reference_ids in the columns specified.
    # The method also validates associated attachment_references in the current
    # object correctly.
    #
    # @return [Array<Array<String>>] Array with 2 elements:
    #   i) previous set of attachment_reference_ids
    #   ii) current set of attachment_reference_ids
    def attachment_reference_id_changes
      attachment_reference_id_changes = Array.new(2, [])
      self.class.attachable_columns.each do |column|
        old_ids, curr_ids = send("#{column}#{ATTACHMENT_CHANGED_SUFFIX}")
        attachment_reference_id_changes[0] += old_ids if old_ids
        attachment_reference_id_changes[1] += curr_ids if curr_ids
      end

      attachment_reference_id_changes
    end

    ATTACHMENT_URL_PREFIX = '/attachments/'

    # Parse all attachment_reference ids in the content, and validate
    # attachment_references. This runs +get_valid_attachment_reference+ through
    # all ids to ensure that
    #
    # @param [String] content The content which associated with the attachments.
    # @return [Array<Integer>] the ids of the attachment references in the content.
    def parse_and_validate_attachment_reference_uuids_from_content(content)
      ids = []
      doc = Nokogiri::HTML(content)
      doc.css('img').each do |image|
        id = parse_attachment_reference_uuid_from_url(image['src']) if image['src']
        valid_id = get_valid_attachment_reference(id) if id

        next unless valid_id
        image['src'] = "#{ATTACHMENT_URL_PREFIX}#{valid_id}" unless valid_id == id
        ids << valid_id
      end

      ids
    end

    # Parse all attachment_reference uuids in the content.
    #
    # @param [String] content The content which associated with the attachments.
    # @return [Array<Integer>] the ids of the attachment references in the content.
    def parse_attachment_reference_uuids_from_content(content)
      ids = []
      doc = Nokogiri::HTML(content)
      doc.css('img').each do |image|
        id = parse_attachment_reference_uuid_from_url(image['src'])
        ids << id if id
      end

      ids
    end

    # Regex for filtering Attachment IDs from URLs.
    ATTACHMENT_ID_REGEX = /\/attachments\/([0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12})$/

    # Parse attachment_reference uuid from the given url.
    #
    # @param [String] uuid The uuid.
    # @return [String|nil] the uuid of the attachment_references, or nil if invalid.
    def parse_attachment_reference_uuid_from_url(url)
      result = url.match(ATTACHMENT_ID_REGEX)
      result ? result[1] : nil
    end

    # Gets the id of the attachment_reference associated with +self+. If an
    # attachment_reference referencing a different attachable is provided, this method
    # creates a new attachment_reference with the given attachment and name. If an
    # incorrect UUID was provided, +nil+ is returned.
    #
    # This handles two cases:
    #   i) Malformed attachment_reference id: returns +nil+.
    #   ii) During duplication, or Copy/Paste: new attachment_references are
    #       automatically created
    #
    # @param [String] id The given UUID of the attachment_reference
    # @return [String|nil] nil if provided ID is not found, otherwise the UUID of the validated
    #                      attachment_reference
    def get_valid_attachment_reference(id)
      object = AttachmentReference.find_by(id: id)
      return nil unless object
      return id if object.attachable == self || object.attachable.nil?

      AttachmentReference.create(attachment: object.attachment, name: object.name).id
    end

    # Given the rich-text content, transform the src of image nodes to direct URLs.
    #
    # If S3 is used as a storage with signed URLs, this would return a URL that has an
    # expiry (based on configuration settings).
    #
    # @param [String] content The content to be prepared
    # @return [String] The parsed content with the URL.
    def prepare_content_for_email(content)
      doc = Nokogiri::HTML.fragment(content)
      doc.css('img').each do |image|
        id = parse_attachment_reference_uuid_from_url(image['src'])
        attachment = AttachmentReference.find(id)&.attachment if id
        image['src'] = attachment.url if attachment&.url
      end
      doc.to_html
    end
  end

  module HasOneAttachment
    extend ActiveSupport::Concern

    included do
      after_commit :clear_attachment_change
      validates :attachment_references, length: { maximum: 1 }

      has_many :attachment_references, as: :attachable, class_name: "::#{AttachmentReference.name}",
                                       inverse_of: :attachable, dependent: :destroy, autosave: true
    end

    def attachment_reference
      attachment_references.take
    end
    # Attachment references can substitute attachments, so allow access using the `attachment`
    # identifier.
    alias_method :attachment, :attachment_reference

    def attachment_reference=(attachment_reference)
      return self.attachment_reference if self.attachment_reference == attachment_reference

      mark_attachment_as_changed(self.attachment_reference)
      attachment_references.clear
      attachment_references << attachment_reference if attachment_reference
    end
    alias_method :attachment=, :attachment_reference=

    def build_attachment_reference(attributes = {})
      mark_attachment_as_changed(attachment_reference)
      attachment_references.clear
      attachment_references.build(attributes)
    end
    alias_method :build_attachment, :build_attachment_reference

    def file=(file)
      if file
        build_attachment_reference(file: file)
      else
        return nil if attachment_reference.nil?
        mark_attachment_as_changed(attachment_reference)
        attachment_references.clear
      end
    end

    # Tracks the the attachment_reference changes and support clear/revert the changes.
    # `attachment_reference` is a virtual attribute, and changes tracking to such attributes are not well supported in
    # rails 5: https://github.com/rails/rails/issues/25787
    def attachment_reference_changed?
      !!@attachment_changed
    end
    alias_method :attachment_changed?, :attachment_reference_changed?

    def mark_attachment_reference_as_changed(old)
      @attachment_changed = true
      @original_attachment = old
    end
    alias_method :mark_attachment_as_changed, :mark_attachment_reference_as_changed

    def clear_attachment_reference_change
      @attachment_changed = false
      @original_attachment = nil
    end
    alias_method :clear_attachment_change, :clear_attachment_reference_change

    # Restore the attachmenet_reference to its previous value.
    def restore_attachment_reference_change
      return unless attachment_reference_changed?
      self.attachment_reference = @original_attachment
      clear_attachment_change
    end
    alias_method :restore_attachment_change, :restore_attachment_reference_change
  end
end
