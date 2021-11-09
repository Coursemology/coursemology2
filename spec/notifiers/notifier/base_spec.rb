# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Notifier::Base, type: :mailer do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    class self::DummyNotifier < Notifier::Base
      def dummy_created(actor, object, user)
        create_activity(actor: actor, object: object, event: :created).notify(user, :popup).
          notify(user, :email).save
      end

      def dummy_updated(actor, object, course)
        create_activity(actor: actor, object: object, event: :created).notify(course, :feed).
          notify(course, :email).save
      end

      def method_missing_tester
        'pass'
      end
    end

    context 'when a specific notifier is provided' do
      let(:user) { create(:user) }
      let(:course) { create(:course) }
      let!(:course_users) { create(:course_user, course: course) }
      let(:notifier) { self.class::DummyNotifier.new }
      let(:template) { 'activity_mailer/test_email' }

      context 'when notifying a user' do
        before do
          allow(notifier).to receive(:notification_view_path).and_return(template)
        end

        subject { notifier.dummy_created(user, user, user) }

        it 'creates an activity' do
          expect { subject }.to change { user.activities.count }.by(1)
        end

        it 'creates a popup notification' do
          expect { subject }.
            to change { user.notifications.where(notification_type: 'popup').count }.by(1)
        end

        it 'creates an email notification' do
          expect { subject }.
            to change { user.notifications.where(notification_type: 'email').count }.by(1)
        end

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when notifying a course' do
        before do
          allow(notifier).to receive(:notification_view_path).and_return(template)
        end

        subject { notifier.dummy_updated(user, user, course) }

        it 'creates an activity' do
          expect { subject }.to change { user.activities.count }.by(1)
        end

        it 'creates a feed notification' do
          expect { subject }.
            to change { course.notifications.where(notification_type: 'feed').count }.by(1)
        end

        it 'creates an email notification' do
          expect { subject }.
            to change { course.notifications.where(notification_type: 'email').count }.by(1)
        end

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end
      end
    end

    describe '.method_missing' do
      subject { self.class::DummyNotifier.method_missing_tester }

      it 'calls the instance method' do
        expect(subject).to eq('pass')
      end
    end

    describe '#notify' do
      let(:notification) { create(:user_notification, notification_type: :email) }
      let(:notifier) { Notifier::Base.new }

      context 'when recipient is invalid' do
        subject { notifier.send(:notify, :invalid_recipient, notification) }

        it 'raises an error' do
          expect { subject }.to raise_error(ArgumentError, 'Invalid recipient type')
        end
      end
    end
  end
end
