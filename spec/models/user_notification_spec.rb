# frozen_string_literal: true
require 'rails_helper'

RSpec.describe UserNotification, type: :model do
  it { is_expected.to belong_to(:activity).inverse_of(:user_notifications) }
  it { is_expected.to belong_to(:user).inverse_of(:notifications) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.next_unread_popup_for_course_user' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_student, course: course) }
      subject { UserNotification.next_unread_popup_for(course_user) }

      it { is_expected.to be_nil }

      context 'when there are multiple notifications' do
        let(:achievements) { create_list(:achievement, 2, course: course) }
        let!(:notifications) do
          achievements.map do |achievement|
            create(:user_notification, :popup_with_achievement_gained,
                   achievement: achievement, user: course_user.user)
          end
        end

        it 'returns notifications in ascending order' do
          earliest = notifications.min_by(&:updated_at)
          expect(subject).to eq(earliest)
        end

        context 'when the activity object is destroyed' do
          before { achievements.first.destroy }

          it 'returns the next notification and deletes the invalid notification' do
            notification = nil
            expect { notification = subject }.to change { course_user.user.notifications.count }.by(-1)
            expect(notification).to eq(notifications[1])
          end
        end

        context 'when notifications are all read' do
          before do
            notifications.each do |notification|
              notification.mark_as_read! for: course_user.user
            end
          end

          it { is_expected.to be_nil }
        end
      end
    end
  end
end
