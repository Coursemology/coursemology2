# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::TopicNotifier, type: :notifier do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    describe '#topic_created' do
      let(:course) { create(:course) }
      let(:forum) { create(:forum, course: course) }
      let!(:topic) { create(:forum_topic, forum: forum) }
      let(:user) { create(:course_user, course: course).user }

      subject { Course::Forum::TopicNotifier.topic_created(user, topic) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end
    end
  end
end
