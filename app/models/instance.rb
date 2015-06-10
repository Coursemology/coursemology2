class Instance < ActiveRecord::Base
  has_settings_on :settings

  class << self
    # Finds the default instance.
    #
    # @return [Instance]
    def default
      result = first
      fail 'Unknown instance. Did you run rake db:seed?' unless result
      result
    end

    # Finds the given tenant by host.
    #
    # @param [String] host The host to look up. This is case insensitive, however prefixes (such
    #   as www) are not handled automatically.
    # @return [Instance]
    def find_tenant_by_host(host)
      where { lower(self.host) == lower(host) }.take
    end
  end

  validates :host, hostname: true, if: :should_validate_host?

  # @!attribute [r] instance_users
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :instance_users
  # @!attribute [r] users
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :users, through: :instance_users

  # @!attribute [r] announcements
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :announcements, -> { order(valid_from: :desc) },
           class_name: Instance::Announcement.name
  # @!attribute [r] courses
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :courses

  # @!method self.with_course_count
  #   Augments all returned records with the number of courses in that instance.
  scope :with_course_count, (lambda do
    joins { courses.outer }.
      select { 'instances.*' }.
      select { count(courses.id).as(course_count) }.
      group { instances.id }
  end)

  # @!method self.with_user_count
  #   Augments all returned records with the number of users in that instance.
  scope :with_user_count, (lambda do
    joins { instance_users.outer }.
      select { 'instances.*' }.
      select { count(instance_users.id).as(user_count) }.
      group { instances.id }
  end)

  def self.use_relative_model_naming?
    true
  end

  private

  def should_validate_host? #:nodoc:
    new_record? || changed_attributes.keys.include?('host'.freeze)
  end
end
