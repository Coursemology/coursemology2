class Instance < ActiveRecord::Base
  has_settings_on :settings

  class << self
    def default
      result = first
      fail 'Unknown instance. Did you run rake db:seed?' unless result
      result
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

  has_many :announcements, -> { order(valid_from: :desc) },
           class_name: Instance::Announcement.name
  has_many :courses
end
