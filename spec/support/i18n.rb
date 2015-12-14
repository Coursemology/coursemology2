RSpec.configure do |config|
  config.before(:suite) do
    # The Stubbed I18n backend will allow certain translation keys to be returned directly, ignoring
    # the presence (or absence) of actual translations. This allows tests to be written without
    # assuming the translation.
    class StubbedI18nBackend < I18n::Backend::Simple
      protected

      def lookup(_, key, _, _)
        key = key.to_s
        result = super
        if always_return_key?(key)
          key
        elsif always_return_actual?(key) || result.nil?
          result
        else
          key
        end
      end

      private

      # Keys which should always be returned instead of the actual translation.
      #
      # @param [String] key The key to check.
      # @return [Boolean]
      def always_return_key?(key)
        key.start_with?('activerecord.attributes.', 'user.', 'sample.', 'helpers.')
      end

      # Keys which should always return the actual translation.
      #
      # @param [String] key The key to check.
      # @return [Boolean]
      def always_return_actual?(key)
        key.start_with?('errors.', 'support.', 'number.')
      end
    end
    I18n.backend = StubbedI18nBackend.new
  end
end
