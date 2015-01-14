module ApplicationThemingConcern
  extend ActiveSupport::Concern

  included do
    theme :deduce_theme
  end

  private

  def deduce_theme
    priorities = []
    priorities << current_tenant.host if current_tenant
    priorities.find(&method(:theme_exists?)) || 'default'
  end

  # Checks if the given theme exists.
  #
  # @param theme_name [String] The name of the theme to check.
  # @return [Boolean] True if the theme exists.
  def theme_exists?(theme_name)
    File.exists?("#{themes_path}/#{theme_name}")
  end

  # Gets the path to the themes directory.
  #
  # @return [String] The path to the themes directory
  def themes_path
    "#{Rails.root}/app/themes"
  end
end
