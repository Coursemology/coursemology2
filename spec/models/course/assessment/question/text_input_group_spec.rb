# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextInputGroup, type: :model do
  it 'belongs to question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::TextInput.name)
  end
  it 'has many points' do
    expect(subject).to have_many(:points).
      class_name(Course::Assessment::Question::TextInputPoint.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:points) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_group?' do
      subject { build_stubbed(:course_assessment_question_text_input_group) }
      it 'returns true' do
        expect(subject.auto_gradable_group?).to be(true)
      end
    end

    describe 'validations' do
      describe '#maximum_group_grade' do
        subject do
          build_stubbed(:course_assessment_question_text_input_group, maximum_group_grade: 5)
        end

        it 'validates that maximum group grade does not exceed maximum grade of the question' do
          subject.question.maximum_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:maximum_group_grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_input_group.attributes.' \
              'maximum_group_grade.invalid_group_grade'))
        end
      end
    end
  end
end
