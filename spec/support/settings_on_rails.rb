# frozen_string_literal: true
module SettingsOnRails::TestHelpers
  # Creates a mock Settings object from the given hash.
  #
  # @param [Hash] hash The settings to mock.
  def mock_settings(hash = {})
    SettingsOnRails::TestHelpers.create_mock_hash(hash)
  end

  class << self
    def create_mock_hash(result = HashWithIndifferentAccess.new)
      result = OpenStruct.new(result)
      stub_hashes!(result)
      result.each_pair do |key, value|
        next unless value.is_a?(Hash)

        result[key] = create_mock_hash(value)
      end

      result
    end

    private

    def stub_hashes!(result)
      result.singleton_class.instance_eval { alias_method :settings, :[] }
      result.define_singleton_method(:map) do |&proc|
        [].tap do |map_result|
          each_pair { |key, value| map_result << proc.call(key, value) }
        end
      end
    end
  end
end

RSpec.configure do |config|
  config.include SettingsOnRails::TestHelpers, type: :model
end
