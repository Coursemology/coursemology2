# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponsePoint, type: :model do
  it 'belongs to point' do
    expect(subject).to belong_to(:group).
      class_name(Course::Assessment::Question::TextResponseGroup.name)
  end
  it 'has many solutions' do
    expect(subject).to have_many(:solutions).
      class_name(Course::Assessment::Question::TextResponseSolution.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:solutions) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_point?' do
      subject { build_stubbed(:course_assessment_question_text_response_point) }
      it 'returns true' do
        expect(subject.auto_gradable_point?).to be(true)
      end
    end

    describe 'validations' do
      describe '#maximum_point_grade' do
        subject do
          build_stubbed(:course_assessment_question_text_response_point, maximum_point_grade: 5)
        end

        it 'validates that maximum point grade does not exceed maximum grade of the group' do
          subject.group.maximum_group_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:maximum_point_grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_point.attributes.' \
              'maximum_point_grade.invalid_point_grade'))
        end
      end
    end

    describe '.default_scope' do
      let(:group) { create(:course_assessment_question_text_response_group, :multiple_points) }

      it 'orders by ascending weight' do
        point_weights = group.points.pluck(:point_weight)
        expect(point_weights.length).to be > 1
        expect(point_weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
