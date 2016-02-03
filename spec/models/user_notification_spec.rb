# frozen_string_literal: true
require 'rails_helper'

RSpec.describe UserNotification, type: :model do
  it { is_expected.to belong_to(:activity).inverse_of(:user_notifications) }
  it { is_expected.to belong_to(:user).inverse_of(:notifications) }
end
