# frozen_string_literal: true
module Extensions::PathnameHelpers::Pathname
  module ClassMethods
    # Normalizes the filename.
    #   Replace following characters with whitespace: / \ ? * : | " < >
    #   Remove leading and trailing whitespaces.
    #   Collapse intra-string whitespaces into single whitespace.
    #   Remove trailing dots.
    #
    # @param [String] filename
    # @return [String] The normalized filename.
    def normalize_filename(filename)
      filename.tr('/"?*:|<>\\', ' ').squish.gsub(/\.+$/, '')
    end

    # Normalizes the path.
    #   Replace '\' with '/'.
    #   Collapse adjacent slashes('/') into single slash.
    #   Adopt +normalize_filename+ to each part of the path.
    #
    # @param [String] path
    # @return [String] The normalized path.
    def normalize_path(path)
      path.tr('\\', '/').
        gsub(/\/+/, '/').
        split('/').map { |name| normalize_filename(name) }.join('/')
    end
  end
end
