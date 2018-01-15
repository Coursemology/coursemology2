# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserNotificationsController, type: :controller do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:json_response) { JSON.parse(response.body) }
    let(:course) { create(:course) }
    let(:user) { create(:user) }
    let!(:course_student) { create(:course_student, course: course, user: user) }

    describe '#mark_as_read' do
      context 'when there are some more unread popups' do
        render_views

        let(:level) { create(:course_level, course: course) }
        let(:level_reached_activity) do
          create(:activity, :level_reached, object: level, actor: user)
        end
        let!(:level_reached_popup) do
          create(:user_notification, :popup, user: user, activity: level_reached_activity)
        end
        let(:achievement) { create(:achievement, :with_badge, course: course) }
        let(:achievement_gained_activity) do
          create(:activity, :achievement_gained, object: achievement, actor: user)
        end
        let!(:achievement_gained_popup) do
          create(:user_notification, :popup, user: user, activity: achievement_gained_activity)
        end
        let(:expected_payload) do
          {
            'id' => achievement_gained_popup.id,
            'notificationType' => 'achievementGained',
            'badgeUrl' => achievement.badge.url,
            'description' => achievement.description,
            'title' => achievement.title
          }
        end

        subject do
          post :mark_as_read,
               params: { course_id: course.id, id: level_reached_popup.id },
               format: :json
        end
        before do
          sign_in(user)
          subject
        end

        it 'marks it current popup as read and renders JSON for the next popup' do
          expect(level_reached_popup).not_to be_unread(user)
          expect(achievement_gained_popup).to be_unread(user)
          expect(json_response).to eq(expected_payload)
        end
      end
    end
  end
end
