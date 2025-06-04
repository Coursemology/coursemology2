# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::RubricBasedResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Question) }

  it 'has many categories' do
    expect(subject).to have_many(:categories).
      class_name(Course::Assessment::Question::RubricBasedResponseCategory.name).
      dependent(:destroy)
  end

  it { is_expected.to accept_nested_attributes_for(:categories) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_rubric_based_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end
  end

  describe 'validations' do
    describe '#validate_at_least_one_category' do
      subject { build(:course_assessment_question_rubric_based_response) }

      it 'is valid when there is at least one category' do
        expect(subject).to be_valid
      end

      it 'is invalid when there are no categories' do
        subject.categories.clear
        expect(subject).not_to be_valid
        expect(subject.errors[:categories]).to include(/at_least_one_category/)
      end
    end

    describe '#validate_unique_category_names' do
      subject { build(:course_assessment_question_rubric_based_response) }

      it 'is valid when category names are unique' do
        expect(subject).to be_valid
      end

      it 'is invalid when there are duplicate category names' do
        subject.categories.build(name: subject.categories.first.name)
        expect(subject).not_to be_valid
        expect(subject.errors[:categories]).to include(/duplicate_category_names/)
      end
    end

    describe '#validate_no_reserved_category_names' do
      subject { build(:course_assessment_question_rubric_based_response) }

      it 'is valid when no category has a reserved name' do
        expect(subject).to be_valid
      end

      it 'is invalid when a category has a reserved name on creation' do
        subject.categories.build(
          name: Course::Assessment::Question::RubricBasedResponse::RESERVED_CATEGORY_NAMES.first,
          is_bonus_category: true
        )
        expect(subject).not_to be_valid
        expect(subject.errors[:categories]).to include(/reserved_category_name/)
      end

      it 'is valid when a category has a reserved name on update' do
        subject.save!
        subject.categories.build(
          name: Course::Assessment::Question::RubricBasedResponse::RESERVED_CATEGORY_NAMES.first,
          is_bonus_category: true
        )
        expect(subject).to be_valid
      end
    end
  end
end
