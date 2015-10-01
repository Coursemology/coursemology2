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

  describe '#satisfied_by?' do
    let(:course_user) do
      course_user = double
      allow(course_user).to receive(:level_number).and_return(10)
      course_user
    end

    context "when the user's level is above or equal to the minimum level" do
      it 'returns true' do
        subject.minimum_level = 9
        expect(subject.satisfied_by?(course_user)).to be_truthy
      end
    end

    context "when the user's level is below the minimum level" do
      it 'returns false' do
        subject.minimum_level = 11
        expect(subject.satisfied_by?(course_user)).to be_falsey
      end
    end
  end
end
