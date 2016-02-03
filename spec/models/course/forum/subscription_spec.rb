# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::Subscription, type: :model do
  it { is_expected.to belong_to(:forum).inverse_of(:subscriptions) }
  it { is_expected.to belong_to(:user) }
end
