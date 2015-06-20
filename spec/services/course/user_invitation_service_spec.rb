require 'rails_helper'

RSpec.describe Course::UserInvitationService do
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

    let(:course) { build(:course) }
    let(:stubbed_user_invitation_service) do
      Course::UserInvitationService.new(course).tap do |result|
        result.define_singleton_method(:invite_users) do |users|
          users
        end
      end
    end
    subject { Course::UserInvitationService.new(course) }

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
        create(:user)
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
          course_user: { name: hash[:name] },
          user_email: { email: hash[:email] }
        }]
      end.to_h
    end

    describe '#invite' do
      def verify_new_user(user)
        created_course_user = course.course_users.find do |course_user|
          course_user.try(:invitation).try(:user_email).try(:email) == user.email
        end
        expect(created_course_user).not_to be_nil
        expect(created_course_user).to be_invited
        expect(created_course_user.name).to eq(user.name)
      end

      def verify_existing_user(user)
        created_course_user = course.course_users.find do |course_user|
          course_user.try(:user).try(:email) == user.email
        end
        expect(created_course_user).not_to be_nil
        expect(created_course_user).to be_approved
        expect(created_course_user.name).to eq(user.name)
      end

      def verify_users
        new_users.each(&method(:verify_new_user))
        existing_users.each(&method(:verify_existing_user))
      end

      it 'accepts a list of invitation form attributes' do
        subject.invite(user_form_attributes)
      end

      it 'accepts a CSV file with a header' do
        subject.invite(temp_csv_from_attributes(user_attributes.map do |attributes|
          OpenStruct.new(attributes)
        end))

        verify_users
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
      end

      context 'when users do not exist in the current instance' do
        it 'invites users' do
          subject.send(:invite_users, new_user_attributes)
          new_users.each do |user|
            expect(course.course_users.any? do |course_user|
              course_user.invitation.present? &&
                course_user.invitation.user_email.email == user.email &&
                course_user.invited?
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
        let!(:instance_user) { create(:instance_user, user: user) }

        it "associates a user's email address" do
          result = subject.send(:find_existing_users, [user_non_primary_email.email])
          expect(result).to have_key(user_non_primary_email.email)
          expect(result[user_non_primary_email.email]).to eq(user)
        end
      end

      context 'when the user does not exist' do
        let!(:user) { create(:user, emails_count: 2) }
        it 'does not define the key' do
          result = subject.send(:find_existing_users, [user.email])
          expect(result).not_to have_key(user.email)
          expect(result).to be_empty
        end
      end
    end

    describe '#add_existing_users' do
      let(:invitations) do
        existing_user_attributes
      end

      it 'adds all users to the course with an approved state' do
        subject.send(:add_existing_users, invitations)
        invitations.each do |invitation|
          invited_user = course.course_users.each.find { |user| user.name == invitation[:name] }
          expect(invited_user).to be_approved
          expect(invited_user.invitation).to be_nil
        end
      end
    end

    describe '#invite_new_users' do
      let(:invitations) do
        new_user_attributes
      end

      it 'adds all users to the course with an invited state' do
        subject.send(:invite_new_users, invitations)
        invitations.each do |invitation|
          invited_user = course.course_users.each.find { |user| user.name == invitation[:name] }
          expect(invited_user).to be_invited
        end
      end

      it 'adds an invitation to the user' do
        subject.send(:invite_new_users, invitations)
        invitations.each do |invitation|
          invited_user = course.course_users.each.find { |user| user.name == invitation[:name] }
          expect(invited_user.invitation.user_email.email).to eq(invitation[:email])
        end
      end
    end

    describe '#user_email_map' do
      it 'returns a hash' do
        expect(subject.send(:user_email_map, [])).to be_a(Hash)
      end

      context "when the user's email exists" do
        let!(:email) { create(:user_email, user: nil) }
        it 'associates the email address with a UserEmail object' do
          result = subject.send(:user_email_map, [email.email])
          expect(result).to have_key(email.email)
          expect(result[email.email]).to eq(email)
        end
      end

      context "when the user's email does not exist" do
        let!(:email) { generate(:email) }
        it 'does not define a key' do
          result = subject.send(:user_email_map, [email])
          expect(result).not_to have_key(email)
          expect(result.size).to eq(0)
        end
      end
    end
  end
end
