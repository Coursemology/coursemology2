class Notification < ActiveRecord::Base
  acts_as_readable on: :updated_at

  has_one :activity, inverse_of: :notification, dependent: :destroy
end