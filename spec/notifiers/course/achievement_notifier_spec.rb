# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AchievementNotifier, type: :mailer do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#achievement_gained' do
      let(:course) { create(:course) }
      let(:achievement) { create(:course_achievement, course: course) }
      let(:user) { create(:course_user, course: course).user }

      subject { Course::AchievementNotifier.achievement_gained(user, achievement) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends a user notification' do
        expect { subject }.to change(user.notifications, :count).by(1)
      end
    end
  end
end
