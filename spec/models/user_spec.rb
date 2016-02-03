# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User do
  it do
    is_expected.to have_many(:emails).
      class_name(User::Email.name).
      inverse_of(:user).
      dependent(:destroy)
  end
  it { is_expected.to have_many(:instance_users) }
  it { is_expected.to have_many(:instances).through(:instance_users) }
  it { is_expected.to have_many(:identities).dependent(:destroy) }
  it { is_expected.to have_many(:course_users).dependent(:destroy) }
  it { is_expected.to have_many(:courses).through(:course_users) }
  it { is_expected.to have_many(:course_group_users).dependent(:destroy) }
  it { is_expected.to have_many(:course_groups).through(:course_group_users) }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    describe '.system' do
      it 'returns the system user' do
        default_user = User.system
        expect(default_user.password).to be_nil
        expect(default_user.email).to be_nil
        expect(default_user.system?).to be_truthy
      end
    end

    describe '#system?' do
      context 'when the user is a normal user' do
        it 'returns false' do
          expect(build_stubbed(:user).system?).to be_falsey
        end
      end
    end

    describe '#emails' do
      let(:user) { create(:user, emails_count: 5) }
      it 'only allows one primary email' do
        user.emails.each.each { |email_record| email_record.primary = true }
        expect { user.save! } .to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    describe '#role' do
      let(:user) { User.new }
      it 'expects to be normal role by default' do
        expect(user.normal?).to eq(true)
      end
    end

    describe '#destroy' do
      let(:instance) { create(:instance) }
      with_tenant(:instance) do
        let(:user) { create(:user) }
        subject { user.destroy }

        it { is_expected.to be_destroyed }
      end
    end

    describe '.new_with_session' do
      context 'when facebook data is provided' do
        let(:params) { {} }
        let(:facebook_data) { build(:omniauth_facebook) }
        let(:session) { { 'devise.facebook_data' => facebook_data } }
        subject { User.new_with_session(params, session) }

        it 'builds the user with information from facebook' do
          expect(subject.name).to eq(facebook_data.info.name)
          expect(subject.email).to eq(facebook_data.info.email)
        end

        context 'when the user did not authorize access to his email address' do
          let(:facebook_data) { build(:omniauth_facebook, :without_email) }
          let(:email) { generate(:email) }
          let(:params) { { email: email } }

          it 'does not override the value provided in the params' do
            expect(subject.email).to eq(email)
          end
        end
      end
    end

    describe '.search' do
      let(:keyword) { 'KeyWord' }
      let!(:user_with_keyword_in_name) do
        user = create(:user, name: 'Awesome' + keyword + 'User')
        # We should not return multiple instances of same user if it has multiple emails
        create(:user_email, user: user, primary: false)
        user
      end
      let!(:user_with_keyword_in_emails) do
        user = create(:user)
        create(:user_email, user: user, email: keyword + generate(:email), primary: false)
        user
      end

      subject { User.search(keyword.downcase).to_a }
      it 'finds the user' do
        expect(subject.count(user_with_keyword_in_name)).to eq(1)
        expect(subject.count(user_with_keyword_in_emails)).to eq(1)
      end
    end

    context 'after user was created' do
      subject { create(:user) }

      it 'creates an instance_user' do
        expect { subject }.to change(instance.instance_users, :count).by(1)
      end
    end

    describe '.unread' do
      let!(:user) { create(:user) }
      let!(:unread_notification) { create(:user_notification, user: user) }

      it 'returns unread notifications of the user' do
        expect(user.notifications.unread).to include(unread_notification)
      end
    end

    describe '.human_users' do
      subject { User.human_users }

      it 'does not include the system user' do
        expect(subject.find_by(id: User::SYSTEM_USER_ID)).to be_nil
      end
    end
  end
end
