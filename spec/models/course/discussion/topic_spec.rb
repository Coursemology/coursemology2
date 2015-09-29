require 'rails_helper'

RSpec.describe Course::Discussion::Topic, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to have_many(:posts).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:topic).dependent(:destroy) }
end
