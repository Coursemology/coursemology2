# frozen_string_literal: true
module CodaveriLanguageConcern
  # TODO: Codaveri currently only accepts major.minor versions, so ".0" minor version is added for Java
  # When Codaveri supports a graceful fallback to specific major.minor.patch when only major version is specified,
  # we should remove this concern

  def polyglot_version
    (polyglot_name == 'java') ? "#{super}.0" : super
  end
end
