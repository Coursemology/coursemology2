# frozen_string_literal: true
module ApplicationInternationalizationConcern
  extend ActiveSupport::Concern

  included do
    before_action :set_locale
  end

  private

  # Sets current locale to http accept(or compatible) language or default locale.
  def set_locale
    client_language = http_accept_language.compatible_language_from(I18n.available_locales)
    I18n.locale = client_language || I18n.default_locale
  end
end
