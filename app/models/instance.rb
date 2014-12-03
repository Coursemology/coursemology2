class Instance < ActiveRecord::Base
  class << self
    def default
      result = self.first
      raise 'Unknown instance. Did you run rake db:seed?' unless result
      result
    end
  end
end
