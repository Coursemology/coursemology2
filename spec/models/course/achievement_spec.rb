require 'rails_helper'

RSpec.describe Course::Achievement, type: :model do
  it { is_expected.to have_many :conditions }
  it { is_expected.to validate_presence_of :title }
  it { is_expected.to belong_to(:creator).class_name User.name }
  it { is_expected.to belong_to(:course).inverse_of :achievements }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.default_scope' do
      it 'orders by ascending weight' do
        weights = Course::Achievement.all.map(&:weight)
        prev_weights = [0] + weights[0..-2]
        zipped_weights = prev_weights.zip(weights)
        greater_than_previous = zipped_weights.map { |(a, b)| a <= b }
        expect(greater_than_previous.all?).to be_truthy
      end
    end
  end
end
