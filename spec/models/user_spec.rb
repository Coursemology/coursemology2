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
  it { is_expected.to have_many(:todos).inverse_of(:user).dependent(:destroy) }
  it { is_expected.to have_many(:instances).through(:instance_users) }
  it { is_expected.to have_many(:identities).dependent(:destroy) }
  it { is_expected.to have_many(:course_users).dependent(:destroy) }
  it { is_expected.to have_many(:courses).through(:course_users) }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    describe '.system' do
      it 'returns the system user' do
        user = User.system
        expect(user.password).to be_nil
        expect(user.email).to be_nil
        expect(user.built_in?).to be_truthy
      end
    end

    describe '.deleted' do
      it 'returns the deleted user' do
        user = User.deleted
        expect(user.password).to be_nil
        expect(user.email).to be_nil
        expect(user.built_in?).to be_truthy
      end
    end

    describe '#built_in?' do
      context 'when the user is a normal user' do
        it 'returns false' do
          expect(build_stubbed(:user).built_in?).to be_falsey
        end
      end
    end

    describe '#emails' do
      let(:user) { create(:user, emails_count: 5) }
      it 'unsets other email as primary when a new email is assigned' do
        email_record = user.emails.reject(&:primary).sample

        user.email = email_record.email
        user.save!

        expect(email_record.reload).to be_primary
        expect(user.emails.reload.to_a.count(&:primary)).to eq(1)
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

    describe '#time_zone' do
      subject { create(:user) }
      before { subject.update_column(:time_zone, persisted_time_zone) }

      context 'when time_zone is not set' do
        let(:persisted_time_zone) { nil }

        it 'defaults to application default' do
          expect(subject.time_zone).to eq(Application.config.x.default_user_time_zone)
        end
      end

      context 'when persisted time_zone was set correctly' do
        let(:persisted_time_zone) { 'Tokyo' }

        it 'returns that time_zone' do
          expect(subject.time_zone).to eq(persisted_time_zone)
        end
      end

      context 'when persisted time_zone is incorrect' do
        let(:persisted_time_zone) { 'Foo' }

        it 'returns the application default' do
          expect(subject.time_zone).to eq(Application.config.x.default_user_time_zone)
        end
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

    describe 'validations' do
      context 'when a built in user is specified' do
        let(:built_in_user_stub) do
          stub = build(:user)
          stub.email = nil
          stub.encrypted_password = ''
          allow(stub).to receive(:built_in?).and_return(true)
          stub
        end
        subject { built_in_user_stub }

        it { is_expected.to be_valid }
        it { is_expected.to validate_absence_of(:email) }
        it { is_expected.to validate_absence_of(:encrypted_password) }
      end

      describe '#time_zone' do
        subject { create(:user) }

        context 'when time_zone is not set' do
          before { subject.time_zone = nil }

          it { is_expected.to be_valid }
        end

        context 'when time_zone is invalid' do
          before { subject.time_zone = 'LOL' }

          it 'is not valid' do
            expect(subject).not_to be_valid
            expect(subject.errors[:time_zone]).to include(
              I18n.t('activerecord.errors.messages.time_zone_validator.invalid_time_zone')
            )
          end
        end

        context 'when time_zone is valid' do
          before { subject.time_zone = 'Tokyo' }

          it { is_expected.to be_valid }
        end
      end
    end

    describe '#send_reset_password_instructions' do
      subject { create(:user) }

      with_active_job_queue_adapter(:test) do
        it 'sends email with ActiveJob queue' do
          expect { subject.send_reset_password_instructions }.to \
            have_enqueued_job.on_queue('mailers')
        end
      end
    end

    describe '#my_students' do
      subject { create(:user) }
      let!(:course) { create(:course) }
      let!(:group_owner) { create(:course_manager, course: course, user: subject) }
      let(:student) { create(:course_student, course: course) }
      let(:another_student) { create(:course_student, course: course) }

      before do
        group = create(:course_group, course: course, creator: subject)
        another_group = create(:course_group, course: course)
        create(:course_group_user, course: course, group: group, course_user: student)
        create(:course_group_user, course: course, group: another_group, course_user: another_student)
      end

      it 'returns my normal course student for a particular course' do
        expect(subject.my_students(course)).to contain_exactly(student)
      end
    end
  end
end
