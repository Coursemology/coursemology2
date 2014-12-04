class Instance < ActiveRecord::Base
  class << self
    def default
      result = self.first
      raise 'Unknown instance. Did you run rake db:seed?' unless result
      result
    end

    # Finds the given tenant by host.
    #
    # @param host [String] The host to look up. This is case insensitive, however prefixes (such
    #                      as www) are not handled automatically.
    def find_tenant_by_host(host)
      where {
          lower(self.host) == lower(host)
      }.take
    end
  end
end
