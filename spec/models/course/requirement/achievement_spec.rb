require 'rails_helper'

RSpec.describe Course::Condition::Achievement, type: :model do
  it { is_expected.to acts_as(:condition).class_name(Course::Condition.name) }
  it { is_expected.to belong_to(:achievement) }
end
