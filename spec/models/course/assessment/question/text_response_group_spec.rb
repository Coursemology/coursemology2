# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseGroup, type: :model do
  it 'belongs to question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::TextResponse.name)
  end
  it 'has many points' do
    expect(subject).to have_many(:points).
      class_name(Course::Assessment::Question::TextResponsePoint.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:points) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_group?' do
      subject { build_stubbed(:course_assessment_question_text_response_group) }
      it 'returns true' do
        expect(subject.auto_gradable_group?).to be(true)
      end
    end

    describe 'validations' do
      describe '#maximum_group_grade' do
        subject do
          build_stubbed(:course_assessment_question_text_response_group, maximum_group_grade: 5)
        end

        it 'validates that maximum group grade does not exceed maximum grade of the question' do
          subject.question.maximum_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:maximum_group_grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_group.attributes.' \
              'maximum_group_grade.invalid_group_grade'))
        end
      end
    end

    describe '.default_scope' do
      let(:question) { create(:course_assessment_question_text_response, :multiple_groups) }

      it 'orders by ascending weight' do
        group_weights = question.groups.pluck(:group_weight)
        expect(group_weights.length).to be > 1
        expect(group_weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
