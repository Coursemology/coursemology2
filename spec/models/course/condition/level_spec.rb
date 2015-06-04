require 'rails_helper'

RSpec.describe Course::Condition::Level, type: :model do
  it { is_expected.to act_as(:condition).class_name(Course::Condition.name) }
end
