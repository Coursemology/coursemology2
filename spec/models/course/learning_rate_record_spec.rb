# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LearningRateRecord, type: :model do
  it { is_expected.to belong_to(:course_user).inverse_of(:learning_rate_records) }
  it { is_expected.to validate_presence_of(:course_user) }
  it { is_expected.to validate_presence_of(:learning_rate) }
  it { is_expected.to validate_presence_of(:effective_min) }
  it { is_expected.to validate_presence_of(:effective_max) }
  it { is_expected.to validate_numericality_of(:learning_rate).is_greater_than_or_equal_to(0) }
  it { is_expected.to validate_numericality_of(:effective_min) }
  it { is_expected.to validate_numericality_of(:effective_max) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:learning_rate_record) { create(:learning_rate_record) }

    describe 'validations' do
      subject { learning_rate_record }

      context 'when learning_rate is less than effective_min' do
        it 'is invalid' do
          subject.assign_attributes(learning_rate: 0.4, effective_min: 0.5)
          expect(subject).not_to be_valid
          expect(subject.errors[:learning_rate]).to be_present
        end
      end

      context 'when learning_rate is greater than effective_max' do
        it 'is invalid' do
          subject.assign_attributes(learning_rate: 2.1, effective_max: 2)
          expect(subject).not_to be_valid
          expect(subject.errors[:learning_rate]).to be_present
        end
      end

      context 'when learning_rate is between effective_min and effective_max' do
        it 'is valid' do
          subject.assign_attributes(learning_rate: 1, effective_min: 0.5, effective_max: 1.5)
          expect(subject).to be_valid
        end
      end

      context 'when learning_rate is equal to both effective_min and effective_max' do
        it 'is valid' do
          subject.assign_attributes(learning_rate: 1, effective_min: 1, effective_max: 1)
          expect(subject).to be_valid
        end
      end
    end

    describe '.default_scope' do
      before { create_list(:learning_rate_record, 5) }

      it 'orders by descending created_at' do
        dates = Course::LearningRateRecord.pluck(:created_at)
        expect(dates.length).to be > 1
        expect(dates.each_cons(2).all? { |x, y| x >= y }).to be_truthy
      end
    end
  end
end
