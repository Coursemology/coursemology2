class Notification < ActiveRecord::Base
  acts_as_readable on: :updated_at
  belongs_to :user
  belongs_to :course

  scope :center_popup, -> { where(type: 'Notification::CenterPopup') }
  scope :right_side_popup, -> { where(type: 'Notification::RightSidePopup') }
  scope :email, -> { where(type: 'Notification::EmailNotification') }

  def self.notify(user, course, options = {})
    case options[:type]
    when :center_popup
      Notification::CenterPopup.notify(user, course, options)
    when :right_side_popup
      Notification::RightSidePopup.notify(user, course, options)
    when :email
      Notification::EmailNotification.notify(user, course, options)
    else
      return
    end
  end

  def self.set_options(notification, options = {})
    notification.title = options[:title]
    notification.content = options[:content]
    notification.button_text = options[:button_text]
    notification.image_url = options[:image_url]
    notification.link = options[:link]
    notification.sharable = options[:sharable]
  end
end
