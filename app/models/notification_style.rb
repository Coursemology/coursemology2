class NotificationStyle < ActiveRecord::Base
  belongs_to :activity, inverse_of: :notification_styles, dependent: :destroy
end
