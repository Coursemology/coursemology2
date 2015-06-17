require 'rails_helper'

RSpec.describe Activity, type: :model do
  describe '.create' do
    let!(:user) { create(:user, name: 'tester') }

    context 'when input formats are valid' do
      subject(:activity) { Activity.create(user, user, user, :tested, formats: [:feed, :popup]) }

      it 'is unread' do
        expect { activity }.to change { Activity.unread_by(user).count }.by(1)
      end

      it 'saves correct information' do
        expect(activity).to_not eq(nil)
        expect(activity.recipient).to eq(user)
        expect(activity.trackable).to eq(user)
        expect(activity.key).to include('users.activities.tested')
        expect(activity.feed).to eq(true)
        expect(activity.popup).to eq(true)
        expect(activity.email).to eq(false)
      end
    end

    context 'when input formats are invalid' do
      subject(:activity) { Activity.create(user, user, user, :tested, formats: [:test, :popup]) }

      it 'raises an error' do
        expect { activity }.to raise_error.
          with_message('Invalid notification format is used to create an activity!')
      end
    end
  end

  describe '#send_email' do
    let!(:user) { create(:user, name: 'tester') }

    let!(:activity) do
      build(:activity, owner: user, recipient: user, trackable: user,
                       key: 'test.activities.tested', email: true)
    end

    before do
      allow(activity).to receive(:template_path).with(:email).
        and_return('../../spec/fixtures/activity_mailer/test_email')
    end

    it 'sends out the email' do
      expect { activity.save }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end
  end

  describe '#template_path' do
    let!(:user) { create(:user, name: 'tester') }
    let!(:activity) { create(:activity, key: 'test.activities.tested') }

    context 'when valid formats are provided' do
      it 'returns a correct path' do
        expect(activity.template_path(:popup)).to eq('/test/activities/tested/popup')
        expect(activity.template_path(:feed)).
          to eq('/test/activities/tested/feed')
        expect(activity.template_path(:email)).to eq('/test/activities/tested/email')
      end
    end

    context 'when invalid formats are provided' do
      it 'returns nil' do
        expect(activity.template_path(:coursemology)).to eq(nil)
      end
    end
  end
end
