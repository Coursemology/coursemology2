# frozen_string_literal: true
# Test group helpers for killing N+1 queries.
module Bullet::TestGroupHelpers
  def self.extended(group)
    return if [:feature].include?(group.metadata[:type])

    group.around(:each) do |example|
      Bullet.profile(&example)
    end
  end
end

RSpec.configure do |config|
  config.extend Bullet::TestGroupHelpers
end
