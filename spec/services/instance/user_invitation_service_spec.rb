# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance::UserInvitationService, type: :service do
  let(:instance) { create(:instance) }
  let(:other_instance) { create(:instance) }
  with_tenant(:instance) do
    def temp_form_hash_from_attributes(records)
      records.map do |record|
        [generate(:nested_attribute_new_id), {
          name: record.name,
          email: record.email
        }]
      end.to_h
    end

    let(:user) { create(:user) }
    let(:stubbed_user_invitation_service) do
      Instance::UserInvitationService.new(user, instance).tap do |result|
        result.define_singleton_method(:invite_users) do |users|
          users
        end
      end
    end
    subject { Instance::UserInvitationService.new(user, instance) }

    let(:existing_roles) { Instance::UserInvitation.roles.keys.sample(3) }
    let(:existing_users) do
      (1..3).map do
        user = create(:user)
        instance.instance_users.where(user: user).destroy_all
        user
      end
    end
    let(:existing_user_attributes) do
      existing_users.each_with_index.map do |user, id|
        { name: user.name, email: user.email,
          role: Instance::UserInvitation.roles[existing_roles[id]] }
      end
    end
    let(:new_roles) { Instance::UserInvitation.roles.keys.sample(3) }
    let(:new_users) do
      (1..3).map do
        build(:user)
      end
    end
    let(:new_user_attributes) do
      new_users.each_with_index.map do |user, id|
        { name: user.name, email: user.email,
          role: Instance::UserInvitation.roles[new_roles[id]] }
      end
    end
    let(:invalid_user_attributes) do
      []
    end
    let(:users) { existing_users + new_users }
    let(:roles) { existing_roles + new_roles }
    let(:user_attributes) { existing_user_attributes + new_user_attributes + invalid_user_attributes }
    let(:user_form_attributes) do
      user_attributes.map do |hash|
        [generate(:nested_attribute_new_id), {
          name: hash[:name],
          email: hash[:email],
          role: hash[:role]
        }]
      end.to_h
    end

    describe '#invite' do
      def verify_existing_user(user)
        created_instance_user = instance.instance_users.find do |instance_user|
          instance_user&.user&.email == user.email
        end
        expect(created_instance_user).not_to be_nil
      end

      def verify_users
        existing_users.each(&method(:verify_existing_user))
      end

      def invite
        subject.invite(user_form_attributes)
      end

      context 'when a list of invitation form attributes are provided' do
        it 'registers everyone' do
          expect(invite).to eq([new_users.size, 0, existing_users.size, 0, 0])
          verify_users
        end

        with_active_job_queue_adapter(:test) do
          it 'sends an email to everyone' do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(user_form_attributes.length)
          end
        end
      end

      context 'when the user is already in the instance or already invited' do
        let(:users_in_instance) { [existing_users.sample] }
        let(:users_invited) { [new_users.sample] }

        before do
          users_in_instance.each { |user| create(:instance_user, user: user) }
          users_invited.each { |user| create(:instance_user_invitation, email: user.email) }
        end

        it 'succeeds' do
          expect(invite).to eq([new_users.size - users_invited.size, users_invited.size,
                                existing_users.size - users_in_instance.size, users_in_instance.size, 0])
        end

        with_active_job_queue_adapter(:test) do
          it 'does not send notification to the existing users' do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(user_attributes.size - users_invited.size - users_in_instance.size)
          end
        end
      end

      context 'when duplicate users are specified' do
        before do
          new_users.push(new_users.last)
        end

        it 'processes duplicate users only once' do
          expect(invite).to eq([new_user_attributes.size - 1, 0, existing_user_attributes.size, 0, 1])
        end

        with_active_job_queue_adapter(:test) do
          it 'sends only one invitation to duplicate users' do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(new_user_attributes.size - 1 + existing_user_attributes.size)
          end
        end
      end

      context 'when an invalid email is specified' do
        let(:invalid_user_attributes) do
          [{ name: build(:user).name, email: 'xxnot an email', role: :normal }]
        end

        it 'fails' do
          expect(invite).to be_falsey
        end

        it 'does not send any notifications' do
          expect { invite }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sets the proper errors' do
          invite
          errors = instance.invitations.map(&:errors).tap(&:compact!).reject(&:empty?)
          expect(errors.length).to eq(1)
          expect(errors.first[:email].first).to match(/invalid/)
        end
      end
    end

    describe '#resend_invitation' do
      let(:previous_sent_time) { 1.day.ago }
      let(:pending_invitations) do
        create_list(:instance_user_invitation, 3, sent_at: previous_sent_time)
      end

      with_active_job_queue_adapter(:test) do
        it 'sends an email to everyone' do
          expect do
            subject.resend_invitation(pending_invitations)
          end.to change { ActionMailer::Base.deliveries.count }.by(pending_invitations.count)
        end
      end

      it 'updates the sent_at field in each invitation' do
        subject.resend_invitation(pending_invitations)
        pending_invitations.each do |invitation|
          expect(invitation.reload.sent_at).not_to eq previous_sent_time
        end
      end

      it 'returns true if there are no errors' do
        expect(subject.resend_invitation(pending_invitations)).to be_truthy
      end
    end

    describe '#parse_from_form' do
      subject { stubbed_user_invitation_service }

      it 'accepts a list of invitation form attributes' do
        result = subject.send(:parse_from_form, user_form_attributes)
        expect(result.length).to eq(user_attributes.length)
      end

      it 'calls #invite_users with appropriate user attributes' do
        result = subject.send(:parse_from_form, user_form_attributes)
        expect(result).to eq(user_attributes)
      end

      context 'when the name is blank' do
        let(:attributes_without_name) do
          user_form_attributes.map do |k, v|
            [k, v.except(:name)]
          end.to_h
        end

        it 'sets the email as the name' do
          results = subject.send(:parse_from_form, attributes_without_name)
          results.each do |result|
            expect(result[:name]).to eq(result[:email])
          end
        end
      end
    end

    describe '#invite_users' do
      context 'when users already exist but not in the current instance' do
        it 'immediately adds users' do
          subject.send(:invite_users, temp_form_hash_from_attributes(existing_users))
          existing_users.each do |user|
            found_user = instance.instance_users.find { |instance_user| instance_user.user == user }
            expect(found_user).not_to be_nil
          end
        end

        context 'when provided emails are capitalised' do
          let(:modified_existing_users) do
            existing_users.each { |user| user.email = user.email.upcase }
          end

          it 'adds the correct users' do
            subject.send(:invite_users,
                         temp_form_hash_from_attributes(modified_existing_users))
            existing_users.each do |user|
              found_user = instance.instance_users.find { |instance_user| instance_user.user == user }
              expect(found_user).not_to be_nil
            end
          end
        end
      end

      context 'when users do not exist at all' do
        it 'sends the invitations' do
          subject.send(:invite_users, temp_form_hash_from_attributes(new_users))
          new_users.each do |user|
            expect(instance.invitations.any? do |invitation|
              invitation.email == user.email
            end).to be_truthy
          end
        end
      end

      context 'when no roles are specified' do
        let(:all_users) { existing_users + new_users }

        it 'defaults to :normal for roles' do
          new_invitations, _, new_instance_users =
            subject.send(:invite_users, temp_form_hash_from_attributes(all_users))
          new_invitations_and_instance_users = new_invitations + new_instance_users
          new_invitations_and_instance_users.all?(&:save)
          new_invitations_and_instance_users.each do |invit|
            expect(invit.normal?).to be_truthy
          end
        end
      end
    end

    describe '#augment_user_objects' do
      context 'when the user exists in the instance' do
        it 'adds the User object' do
          subject.send(:augment_user_objects, user_attributes)
          expect(existing_user_attributes.all? { |d| d[:user].present? }).to be_truthy
        end
      end

      context 'when the user does not exist in the instance' do
        it 'sets the user as nil' do
          subject.send(:augment_user_objects, user_attributes)
          expect(new_user_attributes.all? { |d| d[:user].nil? }).to be_truthy
        end
      end
    end

    describe '#find_existing_users' do
      it 'returns a hash' do
        expect(subject.send(:find_existing_users, [])).to be_a(Hash)
      end

      context 'when the user already exists' do
        let(:user) { create(:user, emails_count: 2) }
        let(:user_non_primary_email) { user.emails.find { |email| email.email != user.email } }

        it "associates a user's email address" do
          result = subject.send(:find_existing_users, [user_non_primary_email.email])
          expect(result).to have_key(user_non_primary_email.email)
          expect(result[user_non_primary_email.email]).to eq(user)
        end
      end

      context 'when the user does not exist' do
        let!(:user) { create(:user) }

        it 'does not define the key' do
          result = subject.send(:find_existing_users, ['foo' + user.email])
          expect(result).not_to have_key(user.email)
          expect(result).to be_empty
        end
      end
    end

    describe '#invite_new_users' do
      let(:invitation_params) do
        new_user_attributes
      end

      it 'adds an invitation to the user' do
        subject.send(:invite_new_users, invitation_params)
        invitation_params.each do |hash|
          invitation = instance.invitations.find { |i| i.name == hash[:name] }
          expect(invitation.email).to eq(hash[:email])
        end
      end
    end
  end
end
