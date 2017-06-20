# frozen_string_literal: true
module Extensions::Attachable::ActionView::Helpers::FormBuilder
  # Method from ActsAsAttachable framework.
  # Hepler to support f.attachments in form
  #
  # @param [Boolean] allow_delete Specify if attachments can be deleted.
  def attachments(allow_delete: true)
    multiple = !object.respond_to?(:attachment)
    @template.render 'layouts/attachment_uploader',
                     f: self, multiple: multiple, allow_delete: allow_delete
  end
  alias_method :attachment, :attachments
end
