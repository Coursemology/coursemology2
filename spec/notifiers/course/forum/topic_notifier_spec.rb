# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::TopicNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let!(:topic) { create(:forum_topic, forum: forum, course: course) }
    let(:course_user) { create(:course_user, course: course) }
    let(:subscriber) { create(:course_user, course: course) }
    let!(:user) do
      user = course_user.user
      forum.subscriptions.create(user: user)
      user
    end
    let!(:subscriber_user) do
      subscriber_user = subscriber.user
      forum.subscriptions.create(user: subscriber_user)
      subscriber
    end

    def set_forum_email_setting(setting, regular, phantom)
      email_setting = course.
                      setting_emails.
                      where(component: :forums,
                            course_assessment_category_id: nil,
                            setting: setting).first
      email_setting.update!(regular: regular, phantom: phantom)
    end

    describe '#new_topic' do
      subject { Course::Forum::TopicNotifier.topic_created(user, course_user, topic) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends an email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      context 'when a user unsubscribes' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :forums,
                                course_assessment_category_id: nil,
                                setting: :new_topic).first
          subscriber.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
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

      context 'when email notification setting is disabled for regular users' do
        before { set_forum_email_setting('new_topic', false, true) }

        it 'does not send email notifications to the regular users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sends email notifications to phantom users' do
          subscriber.update!(phantom: true)
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when email notification setting is disabled for phantom users' do
        before { set_forum_email_setting('new_topic', true, false) }

        it 'does not send email notifications to the phantom users' do
          subscriber.update!(phantom: true)
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sends email notifications to regular users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when email notification setting is disabled for phantom users' do
        before { set_forum_email_setting('new_topic', false, false) }

        it 'does not send an email notifications to the phantom users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when email notification setting is disabled for everyone' do
        before { set_forum_email_setting('new_topic', false, false) }

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
