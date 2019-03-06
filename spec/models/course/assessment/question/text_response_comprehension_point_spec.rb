# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseComprehensionPoint, type: :model do
  it 'belongs to point' do
    expect(subject).to belong_to(:group).
      class_name(Course::Assessment::Question::TextResponseComprehensionGroup.name).
      without_validating_presence
  end
  it 'has many solutions' do
    expect(subject).to have_many(:solutions).
      class_name(Course::Assessment::Question::TextResponseComprehensionSolution.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:solutions) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_point?' do
      subject { build_stubbed(:course_assessment_question_text_response_comprehension_point) }
      it 'returns true' do
        expect(subject.auto_gradable_point?).to be(true)
      end
    end

    describe 'validations' do
      describe '#point_grade' do
        subject do
          build_stubbed(:course_assessment_question_text_response_comprehension_point, point_grade: 5)
        end

        it 'validates that point grade does not exceed maximum grade of the group' do
          subject.group.maximum_group_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:point_grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_comprehension_point.attributes.' \
              'point_grade.invalid_point_grade'))
        end
      end

      describe '#solutions' do
        subject do
          build_stubbed(:course_assessment_question_text_response_comprehension_point, :multiple_compre_lifted_word)
        end

        it 'validates at most one compre_lifted_word solution' do
          expect(subject.valid?).to be(false)
          expect(subject.errors[:solutions]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_comprehension_point.attributes.' \
              'solutions.more_than_one_compre_lifted_word_solution'))
        end
      end
    end
  end
end
