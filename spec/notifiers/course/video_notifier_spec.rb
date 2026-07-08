# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VideoNotifier, type: :mailer do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#video_attempted' do
      let(:course) { create(:course) }
      let!(:video) { create(:video, course: course) }
      let!(:user) { create(:course_user, course: course).user }

      subject { Course::VideoNotifier.video_attempted(user, video) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end
    end
  end
end
