# frozen_string_literal: true
module CodaveriLanguageConcern
  def codaveri_language
    programming_language_map[type.constantize]&.fetch(:language) || polyglot_name
  end

  def codaveri_version
    programming_language_map[type.constantize]&.fetch(:version) || polyglot_version
  end

  private

  def programming_language_map
    {
      Coursemology::Polyglot::Language::CPlusPlus::CPlusPlus11 => {
        language: 'cpp',
        version: '10.2'
      },
      Coursemology::Polyglot::Language::CPlusPlus::CPlusPlus17 => {
        language: 'cpp',
        version: '10.2'
      },
      Coursemology::Polyglot::Language::Java::Java17 => {
        language: 'java',
        version: '17.0'
      },
      Coursemology::Polyglot::Language::Java::Java21 => {
        language: 'java',
        version: '21.0'
      }
    }
  end
end
