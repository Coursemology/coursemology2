require 'rails_helper'

RSpec.describe Course::Notification, type: :model do
  it { is_expected.to belong_to(:activity).inverse_of(:course_notifications) }
end
