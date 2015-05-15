RSpec.configure do |config|
  # Check that the factories are all valid.
  config.before(:suite) do
    # The Stubbed I18n backend will return the translation key, while having the same behaviour
    # as the standard backend. This allows tests to be written without assuming the translation.
    class StubbedI18nBackend < I18n::Backend::Simple
      protected

      def lookup(_, key, _, _)
        super
        key.to_s
      end
    end
    I18n.backend = StubbedI18nBackend.new
  end
end
