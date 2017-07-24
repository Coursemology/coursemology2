# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserInvitationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    def temp_csv_from_attributes(records)
      Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
        file.write(CSV.generate do |csv|
          csv << [:name, :email]
          records.each do |user|
            csv << [user.name, user.email]
          end
        end)
        file.rewind
      end
    end

    let(:course) { create(:course) }
    let(:user) { create(:user) }
    let(:stubbed_user_invitation_service) do
      Course::UserInvitationService.new(user, course).tap do |result|
        result.define_singleton_method(:invite_users) do |users|
          users
        end
      end
    end
    subject { Course::UserInvitationService.new(user, course) }

    let(:existing_users) do
      (1..2).map do
        create(:instance_user).user
      end
    end
    let(:existing_user_attributes) do
      existing_users.map do |user|
        { name: user.name, email: user.email }
      end
    end
    let(:new_users) do
      (1..2).map do
        build(:user)
      end
    end
    let(:new_user_attributes) do
      new_users.map do |user|
        { name: user.name, email: user.email }
      end
    end
    let(:users) { existing_users + new_users }
    let(:user_attributes) { existing_user_attributes + new_user_attributes }
    let(:user_form_attributes) do
      user_attributes.map do |hash|
        [generate(:nested_attribute_new_id), {
          name: hash[:name],
          email: hash[:email]
        }]
      end.to_h
    end

    describe '#invite' do
      def verify_existing_user(user)
        created_course_user = course.course_users.find do |course_user|
          course_user&.user&.email == user.email
        end
        expect(created_course_user).not_to be_nil
        expect(created_course_user.name).to eq(user.name)
      end

      def verify_users
        existing_users.each(&method(:verify_existing_user))
      end

      def invite
        subject.invite(user_form_attributes)
      end

      context 'when a list of invitation form attributes are provided' do
        it 'registers everyone' do
          expect(invite).to be_truthy
          verify_users
        end

        with_active_job_queue_adapter(:test) do
          it 'sends an email to everyone' do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(user_form_attributes.length)
          end
        end
      end

      context 'when a CSV file with a header is uploaded' do
        it 'accepts a CSV file with a header' do
          expect(subject.invite(temp_csv_from_attributes(user_attributes.map do |attributes|
            OpenStruct.new(attributes)
          end))).to be_truthy

          verify_users
        end

        with_active_job_queue_adapter(:test) do
          it 'sends an email to everyone' do
            expect do
              subject.invite(temp_csv_from_attributes(user_attributes.map do |attributes|
                OpenStruct.new(attributes)
              end))
            end.to change { ActionMailer::Base.deliveries.count }.by(user_attributes.length)
          end
        end
      end

      context 'when an invited user is already in the course' do
        let!(:existing_course_user) do
          course.course_users.build(user: existing_users.first).tap(&:save!)
        end

        it 'fails' do
          expect(invite).to be_falsey
        end

        it 'does not send any notifications' do
          expect { invite }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sets the proper errors' do
          invite
          errors = course.course_users.map(&:errors).
                   tap(&:compact!).reject(&:empty?)
          expect(errors.length).to eq(1)
          expect(errors.first[:user_id].first).to match(/been taken/)
          expect(errors.first[:course_id].first).to match(/been taken/)
        end
      end

      context 'when duplicate users are specified' do
        before do
          new_users.push(new_users.last)
        end

        it 'fails' do
          expect(invite).to be_falsey
        end

        it 'does not send any notifications' do
          expect { invite }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sets the proper errors' do
          invite
          errors = course.invitations.map(&:errors).tap(&:compact!).reject(&:empty?)
          expect(errors.length).to eq(2)
          expect(errors.first[:email].all? { |error| error =~ /been taken/ }).to be_truthy
        end
      end

      context 'when an invalid email is specified' do
        before do
          new_users.first.email = 'xxnot an email'
        end

        it 'fails' do
          expect(invite).to be_falsey
        end

        it 'does not send any notifications' do
          expect { invite }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sets the proper errors' do
          invite
          errors = course.invitations.map(&:errors).tap(&:compact!).reject(&:empty?)
          expect(errors.length).to eq(1)
          expect(errors.first[:email].first).to match(/invalid/)
        end
      end
    end

    describe '#resend_invitation' do
      let(:previous_sent_time) { 1.day.ago }
      let(:pending_invitations) do
        create_list(:course_user_invitation, 3, course: course, sent_at: previous_sent_time)
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

    describe '#invite_from_file' do
      subject { stubbed_user_invitation_service }
      let(:temp_csv) { temp_csv_from_attributes(users) }
      after { temp_csv.close! }

      it 'accepts a file with name/header' do
        result = subject.send(:invite_from_file, temp_csv)
        expect(result.length).to eq(users.length)
      end

      it 'calls #invite_users with appropriate user attributes' do
        result = subject.send(:invite_from_file, temp_csv)
        expect(result).to eq(user_attributes)
      end

      context 'when the provided file is invalid' do
        it 'raises an exception' do
          expect do
            subject.send(:invite_from_file,
                         File.open(File.join(__dir__,
                                             '../../fixtures/course/invalid_invitation.csv')))
          end.to raise_exception(CSV::MalformedCSVError)
        end
      end

      context 'when the provided csv file has blanks' do
        subject do
          stubbed_user_invitation_service.
            send(:invite_from_file,
                 File.open(File.join(__dir__,
                                     '../../fixtures/course/empty_invitation.csv')))
        end

        it 'does not raise an exception' do
          expect { subject }.not_to raise_exception
        end

        it 'ignores blank entries and only invites users with both name and emails' do
          # Empty invitation CSV only has 1 full entry
          expect(subject.flatten.count).to eq(1)
        end
      end
    end

    describe '#invite_from_form' do
      subject { stubbed_user_invitation_service }

      it 'accepts a list of invitation form attributes' do
        result = subject.send(:invite_from_form, user_form_attributes)
        expect(result.length).to eq(user_attributes.length)
      end

      it 'calls #invite_users with appropriate user attributes' do
        result = subject.send(:invite_from_form, user_form_attributes)
        expect(result).to eq(user_attributes)
      end
    end

    describe '#invite_users' do
      context 'when users already exist in the current instance' do
        it 'immediately adds users' do
          subject.send(:invite_users, existing_user_attributes)
          existing_users.each do |user|
            found_user = course.course_users.find { |course_user| course_user.user == user }
            expect(found_user).not_to be_nil
          end
        end

        context 'when provided emails are capitalised' do
          let(:modified_existing_user_attributes) do
            existing_user_attributes.each { |attr| attr[:email] = attr[:email].upcase }
          end

          it 'adds the correct users' do
            subject.send(:invite_users, modified_existing_user_attributes)
            existing_users.each do |user|
              found_user = course.course_users.find { |course_user| course_user.user == user }
              expect(found_user).not_to be_nil
            end
          end
        end
      end

      context 'when users do not exist in the current instance' do
        it 'sends the invitations' do
          subject.send(:invite_users, new_user_attributes)
          new_users.each do |user|
            expect(course.invitations.any? do |invitation|
              invitation.email == user.email
            end).to be_truthy
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
        let!(:user) do
          other_instance = create(:instance)
          ActsAsTenant.with_tenant(other_instance) do
            create(:user, emails_count: 2)
          end
        end
        it 'does not define the key' do
          result = subject.send(:find_existing_users, [user.email])
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
          invitation = course.invitations.find { |i| i.name == hash[:name] }
          expect(invitation.email).to eq(hash[:email])
        end
      end
    end
  end
end
