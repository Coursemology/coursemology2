# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Achievement, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      context 'when an achievement is its own condition' do
        subject do
          achievement = create(:achievement, course: course)
          build_stubbed(:achievement_condition,
                        course: course, achievement: achievement, conditional: achievement).
            tap do |achievement_condition|
            allow(achievement_condition).to receive(:achievement_id_changed?).and_return(true)
          end
        end
        it { is_expected.to_not be_valid }
      end

      context "when an achievement is already included in its conditional's conditions" do
        subject do
          existing_achievement_condition = create(:achievement_condition, course: course)
          build(:achievement_condition,
                course: course, conditional: existing_achievement_condition.conditional,
                achievement: existing_achievement_condition.achievement)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:achievement]).to_not be_blank
        end
      end

      # TODO: remove this test when Course::Condition::Achievement#required_achievements_for uses
      # squeel.
      context 'when an achievement is required by another conditional with the same id' do
        subject do
          id = Time.now.to_i
          assessment = create(:assessment, course: course, id: id)
          achievement = create(:achievement, course: course, id: id)
          required_achievement = create(:achievement, course: course)
          create(:achievement_condition,
                 course: course, achievement: required_achievement, conditional: assessment)
          build_stubbed(:achievement_condition,
                        course: course, achievement: required_achievement, conditional: achievement)
        end
        it { is_expected.to be_valid }
      end
    end

    describe 'callbacks' do
      describe '#achievement' do
        let(:user_achievement) { create(:course_user_achievement) }

        context 'when the user achievement has changes' do
          it 'evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Achievement).
              to receive(:evaluate_conditional_for).with(user_achievement.course_user)
            user_achievement.save!
          end
        end

        context 'when the user experiences does not has any changes' do
          it 'does not evaluate_conditional_for the affected course_user' do
            # Remove all the previous changes
            user_achievement.save!
            expect(Course::Condition::Achievement).
              to_not receive(:evaluate_conditional_for).with(user_achievement.course_user)
            user_achievement.save!
          end
        end
      end
    end

    describe '#title' do
      it 'returns the correct achievement title' do
        subject.achievement = create(:course_achievement, course: course)
        expect(subject.title).to eq(subject.achievement.title)
      end
    end

    describe '#satisfied_by?' do
      let(:achievement1) { create(:achievement) }
      let(:achievement2) { create(:achievement) }
      let(:course_user) do
        achievements = instance_double(ActiveRecord::Associations::CollectionProxy)
        allow(achievements).to receive(:exists?).with(achievement1).and_return(true)
        allow(achievements).to receive(:exists?).with(achievement2).and_return(false)
        course_user = instance_double(CourseUser)
        allow(course_user).to receive(:achievements).and_return(achievements)
        course_user
      end

      context 'when the user has the achievement' do
        it 'returns true' do
          subject.achievement = achievement1
          expect(subject.satisfied_by?(course_user)).to be_truthy
        end
      end

      context 'when the user does not have the achievement' do
        it 'returns false' do
          subject.achievement = achievement2
          expect(subject.satisfied_by?(course_user)).to be_falsey
        end
      end
    end

    describe '#dependent_object' do
      it 'returns the correct dependent achievement object' do
        expect(subject.dependent_object).to eq(subject.achievement)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Achievement' do
        expect(Course::Condition::Achievement.dependent_class).to eq(Course::Achievement.name)
      end
    end
  end
end
