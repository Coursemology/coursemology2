# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Level, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course_user) { create(:course_user) }
    describe 'callbacks' do
      describe '#Level' do
        context 'when new experience points record is created' do
          context 'when points is awarded' do
            it 'evaluate_conditional_for the affected course_user' do
              expect(Course::Condition::Level).
                to receive(:evaluate_conditional_for).with(course_user)
              create(:course_experience_points_record, points_awarded: 10, course_user: course_user)
            end
          end

          context 'when point is not awarded' do
            it 'does not evaluate_conditional_for the affected course_user' do
              expect(Course::Condition::Level).
                to_not receive(:evaluate_conditional_for).with(course_user)
              create(:course_experience_points_record,
                     points_awarded: nil,
                     course_user: course_user)
            end
          end
        end

        context 'when experience points record is changed' do
          context 'when awarded points is changed' do
            it 'evaluate_conditional_for the affected course_user' do
              exp = create(:course_experience_points_record,
                           points_awarded: 10,
                           course_user: course_user)
              expect(Course::Condition::Level).
                to receive(:evaluate_conditional_for).with(course_user)
              exp.points_awarded = 20
              exp.save!
            end
          end

          context 'when awarded points is not changed' do
            it 'does not evaluate_conditional_for the affected course_user' do
              exp = create(:course_experience_points_record,
                           points_awarded: 10,
                           course_user: course_user)
              expect(Course::Condition::Level).
                to_not receive(:evaluate_conditional_for).with(course_user)
              exp.reason = 'New reason'
              exp.save!
            end
          end
        end
      end
    end

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

    describe '.dependent_class' do
      it 'returns no class' do
        expect(Course::Condition::Level.dependent_class).to be_nil
      end
    end
  end
end
