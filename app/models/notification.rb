class Notification < ActiveRecord::Base
  acts_as_readable on: :updated_at
end
