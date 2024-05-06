# frozen_string_literal: true
class Instance < ApplicationRecord
  include Instance::CourseComponentsConcern
  include Generic::CollectionConcern

  DEFAULT_INSTANCE_ID = 0

  has_settings_on :settings

  class << self
    # Finds the default instance.
    #
    # @return [Instance]
    def default
      @default ||= find_by(id: DEFAULT_INSTANCE_ID)
      raise 'Unknown instance. Did you run rake db:seed?' unless @default

      @default
    end

    # Finds the given tenant by host.
    #
    # @param [String] host The host to look up. This is case insensitive, however prefixes (such
    #   as www) are not handled automatically.
    # @return [Instance]
    def find_tenant_by_host(host)
      # where.has { self.host.lower == host.downcase }.take
      where(Instance.arel_table[:host].lower.eq(host.downcase)).take
    end

    # Finds the given tenant by host, falling back to the default is none is found.
    #
    # @param [String] host The host to look up. This is case insensitive, however prefixes (such
    #   as www) are not handled automatically.
    # @return [Instance]
    def find_tenant_by_host_or_default(host)
      # tenants = where.has do
      #   (self.host.lower == host.downcase) | (id == DEFAULT_INSTANCE_ID)
      # end.to_a
      tenants = where(Instance.arel_table[:host].lower.
        eq(host.downcase).or(Instance.arel_table[:id].eq(DEFAULT_INSTANCE_ID)))

      tenants.find { |tenant| !tenant.default? } || tenants.first
    end
  end

  after_commit :push_redirect_uris_to_keycloak

  validates :host, hostname: true, if: :should_validate_host?
  validates :name, length: { maximum: 255 }, presence: true
  validates :host, length: { maximum: 255 }, presence: true, uniqueness: { case_sensitive: false, if: :host_changed? }

  # @!attribute [r] instance_users
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :instance_users, dependent: :destroy

  has_many :user_role_requests, class_name: Instance::UserRoleRequest.name, dependent: :destroy,
                                inverse_of: :instance

  # @!attribute [r] users
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :users, through: :instance_users

  # @!attribute [r] invitations
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :invitations, class_name: Instance::UserInvitation.name,
                         dependent: :destroy,
                         inverse_of: :instance

  # @!attribute [r] announcements
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :announcements, class_name: Instance::Announcement.name, dependent: :destroy
  # @!attribute [r] courses
  #   @note You are scoped by the current tenant, you might not see all.
  has_many :courses, dependent: :destroy

  accepts_nested_attributes_for :invitations

  # @!method self.order_by_id(direction = :asc)
  #   Orders the instances by ID.
  scope :order_by_id, ->(direction = :asc) { order(id: direction) }

  scope :order_by_name, ->(direction = :asc) { order(name: direction) }

  # Custom ordering. Put default instance first, followed by the others, which are ordered by name.
  # This is for listing all the instances on the index page.
  # Arel.sql wrapper is required to mark the raw sql string as safe
  scope :order_for_display, (lambda do
    order(Arel.sql("CASE \"id\" WHEN #{DEFAULT_INSTANCE_ID} THEN 0 ELSE 1 END")).order_by_name
  end)

  # @!method containing_user
  #   Selects all the instance with user as one of its members
  #   Note: Must be used with ActsAsTenant#without_tenant block.
  scope :containing_user, (lambda do |user|
    joins(:instance_users).where('instance_users.user_id = ?', user.id)
  end)

  # The number of active courses (in the past 7 days) in the instance.
  calculated :active_course_count, (lambda do
    Course.unscoped.active_in_past_7_days.where('courses.instance_id = instances.id').
      select('count(distinct courses.id)')
  end)

  # @!attribute [r] course_count
  #   The number of courses in the instance.
  calculated :course_count, (lambda do
    Course.unscoped.where('courses.instance_id = instances.id').select("count('*')")
  end)

  # @!attribute [r] user_count
  #   The number of users in the instance.
  calculated :user_count, (lambda do
    InstanceUser.unscoped.where('instance_users.instance_id = instances.id').select("count('*')")
  end)

  # The number of active users (in the past 7 days) in the instance.
  calculated :active_user_count, (lambda do
    InstanceUser.unscoped.where('instance_users.instance_id = instances.id').
      active_in_past_7_days.select("count('*')")
  end)

  def self.use_relative_model_naming?
    true
  end

  # Checks if the current instance is the default instance.
  #
  # @return [Boolean]
  def default?
    id == DEFAULT_INSTANCE_ID
  end

  # Replace the hostname of the default instance.
  def host
    return Application::Application.config.x.default_host if default?

    super
  end

  private

  def push_redirect_uris_to_keycloak
    return if ENV['RAILS_ENV'] == 'test'

    client_id = ENV.fetch('KEYCLOAK_BE_CLIENT_ID', nil)
    client_secret = ENV.fetch('KEYCLOAK_BE_CLIENT_SECRET', nil)
    credentials = Keycloak::Client.get_token_by_client_credentials(client_id, client_secret)
    access_token = JSON.parse(credentials)['access_token']
    service = "clients/#{ENV.fetch('KEYCLOAK_FE_CLIENT_UUID', nil)}"

    hosts = Instance.all.pluck(:host)
    redirect_uris = hosts.map { |h| convert_host_to_redirect_uri(h) }
    Keycloak::Admin.generic_put(service, nil, { redirectUris: redirect_uris }, access_token)
  end

  def convert_host_to_redirect_uri(host)
    default_host = (ENV['RAILS_ENV'] == 'development') ? 'localhost:8080' : ENV.fetch('RAILS_HOSTNAME', nil)

    host = if host == '*'
             default_host
           else
             host.gsub('coursemology.org', default_host)
           end
    (ENV['RACK_ENV'] == 'development') ? "http://#{host}/*" : "https://#{host}/*"
  end

  def should_validate_host?
    new_record? || changed_attributes.keys.include?('host')
  end
end
