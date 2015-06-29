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
        expect(weights.length).not_to eq(0)
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
