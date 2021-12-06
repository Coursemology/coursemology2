# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LevelNotifier, type: :mailer do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#level_reached' do
      let(:course) { create(:course) }
      let(:level) { create(:course_level, course: course) }
      let(:user) { create(:course_user, course: course).user }

      subject { Course::LevelNotifier.level_reached(user, level) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends a user notification' do
        expect { subject }.to change(user.notifications, :count).by(1)
      end
    end
  end
end
