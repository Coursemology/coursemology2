# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::PostNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let!(:topic) { create(:forum_topic, forum: forum, course: course) }
    let(:post) { create(:course_discussion_post, topic: topic.acting_as, creator: user) }
    let(:course_user) { create(:course_user, course: course) }
    let!(:user) do
      user = course_user.user
      topic.subscriptions.create(user: user)
      user
    end
    let!(:subscriber) do
      subscriber = create(:course_user, course: course).user
      topic.subscriptions.create(user: subscriber)
      subscriber
    end

    def set_forum_notification_key(key, value)
      context = OpenStruct.new(key: Course::ForumsComponent.key, current_course: course)
      setting = { 'key' => key, 'enabled' => value }
      Course::Settings::ForumsComponent.new(context).update_email_setting(setting)
      course.save!
    end

    describe '#post_replied' do
      subject { Course::Forum::PostNotifier.post_replied(user, course_user, post) }

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

        context 'when course settings disable notification of phantom course_user posting' do
          before { set_forum_notification_key('post_phantom_replied', false) }

          it 'does not send an email notification' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end
        end
      end

      context 'when email notifications are disabled' do
        before { set_forum_notification_key('post_replied', false) }

        it 'does not send an email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        context 'when course_user is phantom and post_phantom_reply is enabled' do
          before { set_forum_notification_key('post_phantom_replied', true) }

          let(:course_user) { create(:course_user, :phantom, course: course) }

          it 'does not send an email notification' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end
        end
      end
    end
  end
end
