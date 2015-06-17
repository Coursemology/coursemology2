# Activity model inherited from public_activity gem is used to customize activities' management
class Activity < PublicActivity::Activity
  acts_as_readable on: :created_at
  after_create :send_email

  # The formats of notification that are supported
  SUPPORTED_FORMATS = [:feed, :email, :popup]

  # Class methods used to create an activity
  class << self
    # Create an activity record and store the notification formats of it
    #
    # @param from the one triggers this activity
    # @param [User] to the user who will receive notifications
    # @param trackable the object that will be tracked in this activity
    # @param [Symbol] event the name of the activity indicating which event happened
    # @param [Array<Symbol>] formats the formats of the notifications that will be used to inform
    #   users. Any combination of :activity_feed, :email and :popup, is valid
    def create(from, to, trackable, event, formats: nil)
      activity_params = { owner: from, recipient: to, trackable: trackable,
                          key: generate_key(trackable, event) }
      formats = [*formats]
      formats.each do |format|
        fail 'Invalid notification format is used to create an activity!' unless SUPPORTED_FORMATS.
                                                                                 include?(format)
        activity_params[format] = true
      end
      super(activity_params)
    end

    private

    # Generate the key of activity
    #
    # @example generate_key(@course,:created) => courses.activities.created
    #
    # @param trackable The object that will be tracked
    # @param [Symbol] event the name of the activity indicating which event happened
    # @return [String]
    def generate_key(trackable, event)
      "#{trackable.class.name.underscore.pluralize}.activities.#{event}"
    end
  end

  # Translate the key of an activity to the path of a given activity format
  #
  # @example template_path(:popup) => /ClassName/activities/Event/popup
  #
  # @param [Symbol] format the format of notification
  # @return [String] the path of a template
  def template_path(format)
    return unless SUPPORTED_FORMATS.include?(format)
    "/#{key.gsub('.', '/')}/#{format}"
  end

  private

  # Send out an email immediately if the email column of an activity is true
  def send_email
    return unless email
    path = template_path(:email)
    ActivityMailer.email(recipient, trackable, path).deliver_now
  end
end
