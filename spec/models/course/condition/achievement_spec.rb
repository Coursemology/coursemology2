require 'rails_helper'

RSpec.describe Course::Condition::Achievement, type: :model do
  it { is_expected.to act_as(:condition).class_name(Course::Condition.name) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      context 'when an achievement is its own condition' do
        subject do
          build_stubbed(:course_condition_achievement, :self_referential,
                        course: course).tap do |cca|
            allow(cca).to receive(:achievement_id_changed?).and_return(true)
          end
        end
        it { is_expected.to_not be_valid }
      end

      context "when an achievement is already included in its conditional's conditions" do
        subject do
          create(:course_condition_achievement, :duplicate_child, course: course).tap do |cca|
            allow(cca).to receive(:achievement_id_changed?).and_return(true)
          end
        end
        it { is_expected.to_not be_valid }
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
  end
end
