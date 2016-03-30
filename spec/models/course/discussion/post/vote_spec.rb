# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::Vote do
  it { is_expected.to belong_to(:post).inverse_of(:votes) }
end
