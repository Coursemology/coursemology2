# frozen_string_literal: true
module Extensions::Materials::ActionView::Helpers::FormBuilder
  # Hepler to support f.folder in form
  def folder
    @template.render 'layouts/materials_uploader', f: self
  end
end
