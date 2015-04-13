class Instance < ActiveRecord::Base
  include ModuleHostSettingsConcern

  class << self
    def default
      result = first
      fail 'Unknown instance. Did you run rake db:seed?' unless result
      result
    end

    # Returns the current instance from ActsAsTenant
    #
    # @return [Instance] current instance
    def current
      ActsAsTenant.current_tenant
    end

    # Finds the given tenant by host.
    #
    # @param host [String] The host to look up. This is case insensitive, however prefixes (such
    #                      as www) are not handled automatically.
    def find_tenant_by_host(host)
      where { lower(self.host) == lower(host) }.take
    end
  end

  validates :host, hostname: true

  has_many :instance_users
  has_many :users, through: :instance_users

  has_many :announcements, class_name: Instance::Announcement.name

  # @return [Array] array of all available modules
  def modules
    Course::ModuleHost.modules
  end
end
