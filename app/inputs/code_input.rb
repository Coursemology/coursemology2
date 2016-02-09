class CodeInput < SimpleForm::Inputs::TextInput
  private

  def html_options_for(namespace, css_classes)
    return super unless namespace == :input

    super.merge(lang: options[:language])
  end
end
