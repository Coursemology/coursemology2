# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::TopicNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#topic_created' do
      let(:course) { create(:course) }
      let(:forum) { create(:forum, course: course) }
      let!(:topic) { create(:forum_topic, forum: forum) }
      let(:course_user) { create(:course_user, course: course) }
      let!(:user) do
        user = course_user.user
        forum.subscriptions.create(user: user)
        user
      end
      let!(:subscriber) do
        subscriber = create(:course_user, course: course).user
        forum.subscriptions.create(user: subscriber)
        subscriber
      end

      subject { Course::Forum::TopicNotifier.topic_created(user, course_user, topic) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends an email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      context 'when course_user is phantom' do
        let(:course_user) { create(:course_user, :phantom, course: course) }

        it 'does not send a course notification' do
          expect { subject }.not_to change(course.notifications, :count)
        end

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when email notifications are disabled' do
        before do
          context = OpenStruct.new(key: Course::ForumsComponent.key, current_course: course)
          setting = { 'key' => 'topic_created', 'enabled' => false }
          Course::Settings::ForumsComponent.new(context).update_email_setting(setting)
          course.save!
        end

        it 'does not send an email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
