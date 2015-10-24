require 'rails_helper'

RSpec.describe Course::Forum::Topic::View, type: :model do
  it { is_expected.to belong_to(:topic).inverse_of(:views) }
  it { is_expected.to belong_to(:user) }
end
