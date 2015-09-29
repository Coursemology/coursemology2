require 'rails_helper'

RSpec.describe Course::Discussion::Post, type: :model do
  it { is_expected.to belong_to(:topic).inverse_of(:posts) }
  it { is_expected.to belong_to(:creator) }
end
