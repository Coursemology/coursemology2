# frozen_string_literal: true
module Course::Assessment::Question::Programming::PackageGenerationConcern
  extend ActiveSupport::Concern
  include Course::Assessment::Question::Programming::Python::PackageConcern


  def package(language, old_attachment, params)
    case
    when language.is_a?(Coursemology::Polyglot::Language::Python)
      new_package = python_package(old_attachment, params)
      yield new_package if new_package.present?
    else
    end
  end

  def extract_meta(language, attachment)
    case
    when language.is_a?(Coursemology::Polyglot::Language::Python)
      data = python_meta(attachment)
      { editor_mode: 'python', data: data } if data.present?
    else
    end
  end
end
