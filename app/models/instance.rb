class Instance < ActiveRecord::Base
  class << self
    def default
      self.first
    end
  end
end
