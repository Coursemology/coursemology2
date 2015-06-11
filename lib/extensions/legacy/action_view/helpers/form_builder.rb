module Extensions::Legacy::ActionView::Helpers::FormBuilder
  # Method from ActsAsAttachable framework.
  # Hepler to support f.attachments in form
  def attachments
    @template.render 'layouts/attachment_uploader', form_builder: self
  end
end
