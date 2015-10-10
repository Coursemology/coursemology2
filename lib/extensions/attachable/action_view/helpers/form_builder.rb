module Extensions::Attachable::ActionView::Helpers::FormBuilder
  # Method from ActsAsAttachable framework.
  # Hepler to support f.attachments in form
  def attachments
    multiple = !object.respond_to?(:attachment)
    @template.render 'layouts/attachment_uploader', f: self, multiple: multiple
  end
  alias_method :attachment, :attachments
end
