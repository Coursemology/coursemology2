require 'rails_helper'

RSpec.describe Course::Discussion::Topic::Subscription, type: :model do
  it { is_expected.to belong_to(:topic).inverse_of(:subscriptions) }
  it { is_expected.to belong_to(:user).inverse_of(:topic_subscriptions) }
end
