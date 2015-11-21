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

    describe '#email' do
      context 'when the user has no email addresses' do
        let(:user) { User.new }
        it 'does not have a default email' do
          expect(user.email).to eq(nil)
        end
      end

      context 'when the user has multiple email address' do
        context 'no email address is primary' do
          let(:user) do
            user = build(:user, emails_count: 4)
            user.emails.each { |email_record| email_record.primary = false }
            user.emails.each.take(2).each(&:mark_for_destruction)
            user
          end

          it 'picks the first non-deleted email as the primary email' do
            not_marked_for_destruction = user.emails.each.select do |email_record|
              !email_record.marked_for_destruction?
            end
            expect(user.email).to eq(not_marked_for_destruction.first.email)
          end
        end
      end
    end

    describe '#email=' do
      context 'when the user has no email addresses' do
        let(:user) do
          result = build(:user, emails_count: 0)
          result.email = generate(:email)
          result
        end
        it 'creates a new User::Email' do
          expect(user.emails.length).to_not eq(0)
        end

        it 'creates a new primary User::Email' do
          expect(user.emails[0].primary?).to eq(true)
        end

        it 'deletes the only email address when assigning nil' do
          user.email = nil
          expect(user.email).to eq(nil)

          remaining_emails = user.emails.reject(&:marked_for_destruction?)
          expect(remaining_emails.length).to eq(0)
        end
      end

      context 'when the user has multiple email addresses' do
        let(:user) { build(:user, emails_count: 2) }
        context 'when there is no primary email set' do
          it 'sets the first email as primary' do
            user.email = 'test1a@email'
            email_record = user.send(:default_email_record)
            expect(email_record.primary?).to eq(true)
            expect(email_record.email).to eq('test1a@email')
          end
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

    context 'when the user has an invalid email address' do
      subject { build(:user, email: 'xyz@sdf') }

      it 'propagates the error to the error attribute' do
        expect(subject).not_to be_valid
        expect(subject.errors[:email].length).to eq(1)
        expect(subject.errors[:email].first).to match(/invalid/)
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
  end
end
