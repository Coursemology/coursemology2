class Instance < ActiveRecord::Base
  class << self
    def default
      result = self.first
      raise 'Unknown instance. Did you run rake db:seed?' unless result
      result
    end

    # Finds the given tenant by hostname.
    #
    # @param hostname [String] The hostname to look up. This is case insensitive, however prefixes
    #                          (such as www) are not handled automatically.
    def find_tenant_by_hostname(hostname)
      where {
          lower(host) == lower(hostname)
      }.take
    end
  end
end
