class Notification < ActiveRecord::Base
  acts_as_readable on: :updated_at
  belongs_to :user
  belongs_to :course

  scope :center_popup, -> { where(type: 'CenterPopup') }
  scope :right_side_popup, -> { where(type: 'RightSidePopup') }
  scope :email, -> { where(type: 'EmailNotification') }

  def self.types
    %w(CenterPopup RightSidePopup EmailNotification)
  end

  def self.create(user, course, options = {})
    case options['type']
    when 'center_popup'
      CenterPopup.create_notification(user, course, options)
    when 'right_side_popup'
      RightSidePopup.create_notification(user, course, options)
    when 'email'
      EmailNotification.create_notification(user, course, options)
    else
      return
    end
  end

  def self.set_options(notification, options = {})
    notification.title = options[:title]
    notification.content = options[:content]
    notification.image = options[:image]
    notification.link = options[:link]
    notification.share = options[:share]
  end
end
