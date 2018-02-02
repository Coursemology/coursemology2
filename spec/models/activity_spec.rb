# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Activity, type: :model do
  it { is_expected.to belong_to(:actor).inverse_of(:activities).class_name(User.name) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:activity) { create(:activity) }
    let(:user) { create(:user) }
    let(:course) { create(:course) }

    describe '#notify' do
      context 'when recipient is a user' do
        context 'when type is supported' do
          subject { activity.notify(user, :popup).class.name }

          it 'builds a user notification' do
            is_expected.to eq(UserNotification.name)
          end
        end

        context 'when type is unsupported' do
          subject { activity.notify(user, :test) }

          it 'raises an error' do
            expect { subject }.to raise_error(ArgumentError, 'Invalid user notification type')
          end
        end
      end

      context 'when recipient is a course' do
        context 'when type is supported' do
          subject { activity.notify(course, :feed).class.name }

          it 'builds a course notification' do
            is_expected.to eq(Course::Notification.name)
          end
        end

        context 'when type is unsupported' do
          subject { activity.notify(course, :test) }

          it 'raises an error' do
            expect { subject }.to raise_error(ArgumentError, 'Invalid course notification type')
          end
        end
      end

      context 'when recipient is invalid' do
        subject { activity.notify(:test_symbol, :popup) }

        it 'raises an error' do
          expect { subject }.to raise_error(ArgumentError, 'Invalid recipient type')
        end
      end
    end

    describe '#from_course?' do
      let(:course_user) { create(:course_student, course: course) }
      let(:achievement) { create(:achievement, course: course) }
      let(:activity) do
        create(:activity, :achievement_gained, object: achievement, actor: user)
      end

      context 'when activity object is from course' do
        subject { activity.from_course?(course) }

        it { is_expected.to be_truthy }

        context 'when activity object is deleted' do
          before do
            achievement.destroy
            activity.reload
          end

          it { is_expected.to be_falsey }
        end
      end

      context 'when activity object is not from course' do
        let(:other_course) { create(:course) }
        subject { activity.from_course?(other_course) }

        it { is_expected.to be_falsey }

        context 'when activity object is deleted' do
          before do
            achievement.destroy
            activity.reload
          end

          it { is_expected.to be_falsey }
        end
      end
    end
  end
end
