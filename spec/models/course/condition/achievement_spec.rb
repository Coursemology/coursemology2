# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Achievement, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      context 'when an achievement is its own condition' do
        subject do
          achievement = create(:achievement, course: course)
          build(:achievement_condition,
                course: course, achievement: achievement, conditional: achievement)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:achievement]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/achievement.attributes.achievement.references_self'))
        end
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
          expect(subject.errors[:achievement]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/achievement.attributes.achievement.unique_dependency'))
        end
      end

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

      context 'when an achievement has the conditional as its own conditions' do
        subject do
          achievement1 = create(:achievement, course: course)
          achievement2 = create(:achievement, course: course)
          create(:achievement_condition,
                 course: course, achievement: achievement1, conditional: achievement2)
          build(:achievement_condition,
                course: course, achievement: achievement2, conditional: achievement1)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:achievement]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/achievement.attributes.achievement.cyclic_dependency'))
        end
      end
    end

    describe 'callbacks' do
      describe '#achievement' do
        let(:course_user) { create(:course_user) }

        context 'when a new user achievement is created' do
          it 'evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Achievement).
              to receive(:evaluate_conditional_for).with(course_user)
            create(:course_user_achievement, course_user: course_user)
          end
        end

        context 'when the user achievement does not has any changes' do
          it 'does not evaluate_conditional_for the affected course_user' do
            user_achievement = create(:course_user_achievement, course_user: course_user)
            expect(Course::Condition::Achievement).
              to_not receive(:evaluate_conditional_for).with(course_user)
            user_achievement.save!
          end
        end

        context 'when the user achievement is destroyed' do
          it 'evaluate_conditional_for the affected course_user' do
            user_achievement = create(:course_user_achievement, course_user: course_user)
            expect(Course::Condition::Achievement).
              to receive(:evaluate_conditional_for).with(course_user)
            user_achievement.destroy!
          end
        end

        context 'when the user achievement is destroyed through update attributes' do
          it 'evaluate_conditional_for the affected course_user' do
            user_achievement = create(:course_user_achievement, course_user: course_user)
            expect(Course::Condition::Achievement).
              to receive(:evaluate_conditional_for).with(course_user)
            user_achievement.achievement.update(course_user_ids: [])
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
        allow(achievements).to receive(:exists?).with(achievement1.id).and_return(true)
        allow(achievements).to receive(:exists?).with(achievement2.id).and_return(false)
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
