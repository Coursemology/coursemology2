require 'rails_helper'

RSpec.describe Course::Condition::Level, type: :model do
  it { is_expected.to act_as(:condition).class_name(Course::Condition.name) }

  describe '#title' do
    it 'returns the correct level title' do
      subject.minimum_level = 10
      expect(subject.title).
        to eq(Course::Condition::Level.human_attribute_name('title.title', value: 10))
    end
  end
end
