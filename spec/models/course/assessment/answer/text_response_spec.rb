require 'rails_helper'

RSpec.describe Course::Assessment::Answer::TextResponse, type: :model do
  it { is_expected.to act_as(:answer) }
end
