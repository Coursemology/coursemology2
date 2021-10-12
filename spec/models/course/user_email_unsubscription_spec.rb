require 'rails_helper'

RSpec.describe Course::UserEmailUnsubscription, type: :model do
  it { is_expected.to belong_to(:course_user).inverse_of(:email_unsubscriptions) }
  it { is_expected.to belong_to(:course_setting_email).inverse_of(:email_unsubscriptions) }
end