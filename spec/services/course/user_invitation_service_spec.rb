# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserInvitationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    def temp_csv_from_attributes(records, roles = [], timeline_algorithms = [])
      include_timeline = course.show_personalized_timeline_features?
      Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
        file.write(CSV.generate do |csv|
          headers = ['Name', 'Email', 'External ID', 'Role', 'Phantom']
          headers << 'Personal Timeline' if include_timeline
          csv << headers
          records.zip(roles, timeline_algorithms).each do |user, role, timeline_algorithm|
            csv << if role.blank?
                     [user.name, user.email]
                   elsif include_timeline
                     [user.name, user.email, nil, role, false, timeline_algorithm]
                   else
                     [user.name, user.email, nil, role, false]
                   end
          end
        end)
        file.rewind
      end
    end

    let(:course) { create(:course) }
    let(:course_user) { create(:course_manager, course: course) }
    let(:user) { course_user.user }
    let(:stubbed_user_invitation_service) do
      Course::UserInvitationService.new(course_user, user, course).tap do |result|
        result.define_singleton_method(:invite_users) do |users|
          users
        end
      end
    end
    subject { Course::UserInvitationService.new(course_user, user, course) }

    let(:existing_roles) { Course::UserInvitation.roles.keys.sample(3).map(&:to_sym) }
    let(:existing_timeline_algorithms) { Course::UserInvitation.timeline_algorithms.keys.sample(3).map(&:to_sym) }
    let(:existing_users) do
      (1..3).map do
        create(:instance_user).user
      end
    end
    let(:existing_user_attributes) do
      existing_users.each_with_index.map do |user, id|
        { name: user.name, email: user.email, phantom: false,
          role: existing_roles[id], timeline_algorithm: existing_timeline_algorithms[id], external_id: nil }
      end
    end
    let(:new_roles) { Course::UserInvitation.roles.keys.sample(3).map(&:to_sym) }
    let(:new_timeline_algorithms) { Course::UserInvitation.timeline_algorithms.keys.sample(3).map(&:to_sym) }
    let(:new_users) do
      (1..3).map do
        build(:user)
      end
    end
    let(:new_user_attributes) do
      new_users.each_with_index.map do |user, id|
        { name: user.name, email: user.email, phantom: false,
          role: new_roles[id], timeline_algorithm: new_timeline_algorithms[id], external_id: nil }
      end
    end
    let(:invalid_user_attributes) do
      []
    end
    let(:users) { existing_users + new_users }
    let(:roles) { existing_roles + new_roles }
    let(:timeline_algorithms) { existing_timeline_algorithms + new_timeline_algorithms }
    let(:user_attributes) { existing_user_attributes + new_user_attributes + invalid_user_attributes }
    let(:user_form_attributes) do
      user_attributes.to_h do |hash|
        [generate(:nested_attribute_new_id),
         name: hash[:name],
         email: hash[:email],
         role: hash[:role],
         phantom: hash[:phantom],
         timeline_algorithm: hash[:timeline_algorithm]]
      end
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
          expect(invite.map(&:size)).to eq([new_users.size, 0, existing_users.size, 0, 0, 0, 0])
          verify_users
        end

        with_active_job_queue_adapter(:test) do
          it 'sends an email to everyone', type: :mailer do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(user_form_attributes.length)
          end
        end
      end

      context 'when a CSV file with a header is uploaded' do
        it 'accepts a CSV file with a header' do
          expect(subject.invite(temp_csv_from_attributes(user_attributes.map do |attributes|
            OpenStruct.new(attributes)
          end)).map(&:size)).to eq([new_users.size, 0, existing_users.size, 0, 0, 0, 0])

          verify_users
        end

        with_active_job_queue_adapter(:test) do
          it 'sends an email to everyone', type: :mailer do
            expect do
              subject.invite(temp_csv_from_attributes(user_attributes.map do |attributes|
                OpenStruct.new(attributes)
              end))
            end.to change { ActionMailer::Base.deliveries.count }.by(user_attributes.length)
          end
        end
      end

      context 'when the user is already in the course or already invited' do
        let(:users_in_course) { [existing_users.sample] }
        let(:users_invited) { [new_users.sample] }
        before do
          users_in_course.each { |user| create(:course_student, course: course, user: user) }
          users_invited.each { |user| create(:course_user_invitation, course: course, email: user.email) }
        end

        it 'succeeds' do
          expect(invite.map(&:size)).to eq([new_users.size - users_invited.size, users_invited.size,
                                            existing_users.size - users_in_course.size, users_in_course.size, 0, 0, 0])
        end

        with_active_job_queue_adapter(:test) do
          it 'does not send notification to the existing users', type: :mailer do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(user_attributes.size - users_invited.size - users_in_course.size)
          end
        end
      end

      context 'when duplicate emails differ only in case' do
        let(:form_attributes) do
          { generate(:nested_attribute_new_id) => { name: 'Alice', email: 'Alice@Example.COM',
                                                    role: :student, phantom: false,
                                                    external_id: nil },
            generate(:nested_attribute_new_id) => { name: 'Alice2', email: 'alice@example.com',
                                                    role: :student, phantom: false,
                                                    external_id: nil } }
        end

        it 'treats them as duplicate and processes only the first' do
          _new_invitations, _existing, _new_cu, _existing_cu, failed_users = subject.invite(form_attributes)
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:duplicate_email_in_file)
        end
      end

      context 'when duplicate users are specified' do
        before do
          new_users.push(new_users.last)
        end

        it 'processes duplicate users only once' do
          expect(invite.map(&:size)).to eq([new_user_attributes.size - 1, 0, existing_user_attributes.size, 0, 1, 0, 0])
        end

        it 'tags the duplicate user with a duplicate_email reason' do
          _new_invitations, _existing_invitations, _new_course_users, _existing_course_users, failed_users = invite
          expect(failed_users.first[:reason]).to eq(:duplicate_email_in_file)
        end

        with_active_job_queue_adapter(:test) do
          it 'sends only one invitation to duplicate users', type: :mailer do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(new_user_attributes.size - 1 + existing_user_attributes.size)
          end
        end
      end

      context 'when two invitations in the same batch share the same external_id' do
        let(:form_attributes) do
          { generate(:nested_attribute_new_id) => { name: 'User A', email: generate(:email),
                                                    role: :student, phantom: false,
                                                    external_id: 'shared-id' },
            generate(:nested_attribute_new_id) => { name: 'User B', email: generate(:email),
                                                    role: :student, phantom: false,
                                                    external_id: 'shared-id' } }
        end

        it 'processes only the first and treats the second as a duplicate' do
          result = subject.invite(form_attributes)
          expect(result).not_to be_nil
          new_invitations, _existing_invitations, _new_course_users, _existing_course_users, failed_users = result
          expect(new_invitations.size).to eq(1)
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:external_id]).to eq('shared-id')
        end

        it 'tags the duplicate user with a duplicate_external_id reason' do
          result = subject.invite(form_attributes)
          _new_invitations, _existing_invitations, _new_course_users, _existing_course_users, failed_users = result
          expect(failed_users.first[:reason]).to eq(:duplicate_external_id_in_file)
        end
      end

      context 'when an invitation has a duplicate external_id matching an existing course user' do
        let!(:existing_course_user) { create(:course_student, course: course, external_id: 'taken-id') }
        let(:form_attributes) do
          { generate(:nested_attribute_new_id) => { name: 'New User', email: generate(:email),
                                                    role: :student, phantom: false,
                                                    external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(form_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'does not abort the batch' do
          expect(result).not_to be_nil
        end

        it 'puts the conflicting row in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
          expect(failed_users.first[:external_id]).to eq('taken-id')
        end

        it 'does not create a new invitation' do
          new_invitations, = result
          expect(new_invitations).to be_empty
        end
      end

      context 'when an invitation has a duplicate external_id matching a pending invitation' do
        let!(:pending_invitation) { create(:course_user_invitation, course: course, external_id: 'taken-id') }
        let(:form_attributes) do
          { generate(:nested_attribute_new_id) => { name: 'New User', email: generate(:email),
                                                    role: :student, phantom: false,
                                                    external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(form_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'does not abort the batch' do
          expect(result).not_to be_nil
        end

        it 'puts the conflicting row in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
        end
      end

      context 'when a CSV (with personalized timelines) has a duplicate external_id for an existing course user' do
        let!(:existing_course_user) { create(:course_student, course: course, external_id: 'taken-id') }

        def csv_with_external_id_and_timeline(entries)
          Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |csv|
              csv << ['Name', 'Email', 'External ID', 'Role', 'Phantom', 'Personal Timeline']
              entries.each do |entry|
                csv << [entry[:name], entry[:email], entry[:external_id], 'student', 'false', 'fixed']
              end
            end)
            file.rewind
          end
        end

        it 'does not abort the batch' do
          csv = csv_with_external_id_and_timeline(
            [name: 'New User', email: generate(:email), external_id: 'taken-id']
          )
          result = subject.invite(csv)
          expect(result).not_to be_nil
          _, _, _, _, failed_users = result
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
          csv.close!
        end
      end

      context 'when the CSV has duplicate column headers' do
        it 'raises CSV::MalformedCSVError for same-language duplicates' do
          csv = Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |c|
              c << ['Name', 'Name', 'Email', 'External ID', 'Role', 'Phantom']
              c << ['Alice', 'Alice', generate(:email), 'EXT001', 'student', 'false']
            end)
            file.rewind
          end
          expect { subject.invite(csv) }.to raise_error(CSV::MalformedCSVError)
          csv.close!
        end

        it 'raises CSV::MalformedCSVError for cross-language duplicates' do
          csv = Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |c|
              c << ['Name', '姓名', 'Email', 'External ID', 'Role', 'Phantom']
              c << ['Alice', 'Alice', generate(:email), 'EXT001', 'student', 'false']
            end)
            file.rewind
          end
          expect { subject.invite(csv) }.to raise_error(CSV::MalformedCSVError)
          csv.close!
        end
      end

      context 'when a timeline-template-header CSV is uploaded to a non-timeline course' do
        before { course.update!(show_personalized_timeline_features: false) }

        it 'accepts a timeline-format CSV even when the course has timelines disabled' do
          csv = Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |c|
              c << ['Name', 'Email', 'External ID', 'Role', 'Phantom', 'Personal Timeline']
              c << ['Alice', generate(:email), 'EXT001', 'student', 'false', 'otot']
            end)
            file.rewind
          end
          new_invitations, = subject.invite(csv)
          expect(new_invitations.first.timeline_algorithm).to eq('otot')
          csv.close!
        end
      end

      context 'when a CSV (without personalized timelines) has a duplicate external_id for an existing course user' do
        before { course.update!(show_personalized_timeline_features: false) }
        let!(:existing_course_user) { create(:course_student, course: course, external_id: 'taken-id') }

        def csv_with_external_id_no_timeline(entries)
          Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |csv|
              csv << ['Name', 'Email', 'External ID', 'Role', 'Phantom']
              entries.each do |entry|
                csv << [entry[:name], entry[:email], entry[:external_id], 'student', 'false']
              end
            end)
            file.rewind
          end
        end

        it 'does not abort the batch' do
          csv = csv_with_external_id_no_timeline(
            [name: 'New User', email: generate(:email), external_id: 'taken-id']
          )
          result = subject.invite(csv)
          expect(result).not_to be_nil
          _, _, _, _, failed_users = result
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
          csv.close!
        end
      end

      context 'when re-inviting a pending invitation with a new external_id (current nil, CSV value free)' do
        let!(:pending_invitation) do
          create(:course_user_invitation, course: course,
                                          email: 'pending@example.com', external_id: nil)
        end
        let(:invitation_attributes) do
          { '0' => { name: 'Pending User', email: 'pending@example.com', role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'new-id' } }
        end
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'raises PendingExternalIdUpdates without resolution' do
          expect { invitation_service.invite(invitation_attributes) }.
            to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
        end

        it 'surfaces the pending invitation with correct IDs in the error' do
          err = begin
            invitation_service.invite(invitation_attributes)
          rescue Course::UserInvitationService::PendingExternalIdUpdates => e
            e
          end
          entry = err.pending_invitation_updates.find { |u| u[:record] == pending_invitation }
          expect(entry[:new_external_id]).to eq('new-id')
          expect(entry[:previous_external_id]).to be_nil
        end

        it 'updates the invitation external_id with resolution :replace_all' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :replace_all)
          expect(pending_invitation.reload.external_id).to eq('new-id')
        end

        it 'keeps nil external_id with resolution :keep_existing' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :keep_existing)
          expect(pending_invitation.reload.external_id).to be_nil
        end
      end

      context 'when re-inviting a failed invitation (is_retryable: false) with a new external_id' do
        let!(:failed_invitation) do
          create(:course_user_invitation, course: course,
                                          email: 'failed@example.com',
                                          external_id: 'old-id',
                                          is_retryable: false)
        end
        let(:invitation_attributes) do
          { '0' => { name: 'Failed User', email: 'failed@example.com', role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'new-id' } }
        end
        subject(:result) { invitation_service.invite(invitation_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'does not update the external_id' do
          result
          expect(failed_invitation.reload.external_id).to eq('old-id')
        end

        it 'puts the invitation in existing_invitations, not updated_invitations' do
          existing_invitations = result[1]
          updated_invitations = result[5]
          expect(existing_invitations).to include(failed_invitation)
          expect(updated_invitations.map { |u| u[:record] }).not_to include(failed_invitation)
        end

        it 'does not create a failed_users entry' do
          _, _, _, _, failed_users = result
          expect(failed_users).to be_empty
        end
      end

      context 'when an existing course user is re-invited with a new external_id (current nil, CSV value free)' do
        let!(:enrolled_user) { create(:user) }
        let!(:course_user_record) { create(:course_student, course: course, user: enrolled_user, external_id: nil) }
        let(:invitation_attributes) do
          { '0' => { name: enrolled_user.name, email: enrolled_user.email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'new-id' } }
        end
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'raises PendingExternalIdUpdates without resolution' do
          expect { invitation_service.invite(invitation_attributes) }.
            to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
        end

        it 'surfaces the course user with correct IDs in the error' do
          err = begin
            invitation_service.invite(invitation_attributes)
          rescue Course::UserInvitationService::PendingExternalIdUpdates => e
            e
          end
          entry = err.pending_course_user_updates.find { |u| u[:record] == course_user_record }
          expect(entry[:new_external_id]).to eq('new-id')
          expect(entry[:previous_external_id]).to be_nil
        end

        it 'updates the course_user external_id with resolution :replace_all' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :replace_all)
          expect(course_user_record.reload.external_id).to eq('new-id')
        end

        it 'keeps nil external_id with resolution :keep_existing' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :keep_existing)
          expect(course_user_record.reload.external_id).to be_nil
        end
      end

      context 'when an existing course user with a non-nil external_id is re-invited with a different free value' do
        let!(:enrolled_user) { create(:user) }
        let!(:course_user_record) do
          create(:course_student, course: course, user: enrolled_user, external_id: 'old-id')
        end
        let(:invitation_attributes) do
          { '0' => { name: enrolled_user.name, email: enrolled_user.email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'new-id' } }
        end
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'updates the course_user external_id with resolution :replace_all' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :replace_all)
          expect(course_user_record.reload.external_id).to eq('new-id')
        end

        it 'keeps the old external_id with resolution :keep_existing' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :keep_existing)
          expect(course_user_record.reload.external_id).to eq('old-id')
        end
      end

      context 'when an existing course user is re-invited and the external_id is already taken' do
        let!(:other_user) { create(:course_student, course: course, external_id: 'taken-id') }
        let!(:enrolled_user) { create(:user) }
        let!(:course_user_record) { create(:course_student, course: course, user: enrolled_user, external_id: nil) }
        let(:invitation_attributes) do
          { '0' => { name: enrolled_user.name, email: enrolled_user.email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(invitation_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'does not abort the batch' do
          expect(result).not_to be_nil
        end

        it 'puts the user in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.map { |u| u[:reason] }).to include(:external_id_taken)
        end

        it 'does not update the course_user external_id' do
          result
          expect(course_user_record.reload.external_id).to be_nil
        end
      end

      context 'when a new user is invited but the external_id matches an existing course user' do
        let!(:existing_course_user_ext) { create(:course_student, course: course, external_id: 'taken-id') }
        let(:new_user) { create(:user) }
        let(:invitation_attributes) do
          { '0' => { name: new_user.name, email: new_user.email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(invitation_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'does not abort the batch' do
          expect(result).not_to be_nil
        end

        it 'puts the row in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
        end

        it 'does not enroll the user' do
          _, _, new_course_users, = result
          expect(new_course_users).to be_empty
        end
      end

      context 'when a new user is enrolled but the external_id matches a pending invitation' do
        let!(:pending_inv) { create(:course_user_invitation, course: course, external_id: 'taken-id') }
        let(:new_user) { create(:user) }
        let(:invitation_attributes) do
          { '0' => { name: new_user.name, email: new_user.email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(invitation_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'puts the row in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
        end

        it 'does not enroll the user' do
          _, _, new_course_users, = result
          expect(new_course_users).to be_empty
        end
      end

      context 'when an existing course user is re-invited and the external_id is taken by a pending invitation' do
        let!(:pending_inv) { create(:course_user_invitation, course: course, external_id: 'taken-id') }
        let!(:enrolled_user) { create(:user) }
        let!(:course_user_record) { create(:course_student, course: course, user: enrolled_user, external_id: nil) }
        let(:invitation_attributes) do
          { '0' => { name: enrolled_user.name, email: enrolled_user.email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(invitation_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'puts the user in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.map { |u| u[:reason] }).to include(:external_id_taken)
        end

        it 'does not update the course_user external_id' do
          result
          expect(course_user_record.reload.external_id).to be_nil
        end
      end

      context 'when re-inviting a pending invitation whose CSV ext_id is taken by another member' do
        let!(:other_user) { create(:course_student, course: course, external_id: 'taken-id') }
        let!(:pending_invitation) do
          create(:course_user_invitation, course: course,
                                          email: 'pending@example.com', name: 'Pending User', external_id: 'old-id')
        end
        let(:invitation_attributes) do
          { '0' => { name: 'Pending User', email: 'pending@example.com', role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'taken-id' } }
        end
        subject(:result) { invitation_service.invite(invitation_attributes) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'puts the user in failed_users with :external_id_taken reason' do
          _, _, _, _, failed_users = result
          expect(failed_users.map { |u| u[:reason] }).to include(:external_id_taken)
        end

        it 'does not update the pending invitation external_id' do
          result
          expect(pending_invitation.reload.external_id).to eq('old-id')
        end
      end

      context 'when re-inviting a pending invitation with a non-nil ext_id and CSV provides a free different value' do
        let!(:pending_invitation) do
          create(:course_user_invitation, course: course,
                                          email: 'pending@example.com', name: 'Pending User', external_id: 'old-id')
        end
        let(:invitation_attributes) do
          { '0' => { name: 'Pending User', email: 'pending@example.com', role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'new-id' } }
        end
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'raises PendingExternalIdUpdates without resolution' do
          expect { invitation_service.invite(invitation_attributes) }.
            to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
        end

        it 'surfaces the pending invitation with correct IDs in the error' do
          err = begin
            invitation_service.invite(invitation_attributes)
          rescue Course::UserInvitationService::PendingExternalIdUpdates => e
            e
          end
          entry = err.pending_invitation_updates.find { |u| u[:record] == pending_invitation }
          expect(entry[:new_external_id]).to eq('new-id')
          expect(entry[:previous_external_id]).to eq('old-id')
        end

        it 'updates the invitation external_id with resolution :replace_all' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :replace_all)
          expect(pending_invitation.reload.external_id).to eq('new-id')
        end

        it 'keeps the old external_id with resolution :keep_existing' do
          invitation_service.invite(invitation_attributes, external_id_resolution: :keep_existing)
          expect(pending_invitation.reload.external_id).to eq('old-id')
        end
      end

      context 'when a batch changes an existing invitation ext_id and a later row claims the freed id' do
        let!(:alice_invitation) do
          create(:course_user_invitation, course: course,
                                          email: 'alice@example.com', name: 'Alice', external_id: 'freed-id')
        end
        let(:bob_email) { generate(:email) }
        let(:invitation_attributes) do
          { '0' => { name: 'Alice', email: 'alice@example.com', role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'new-id' },
            '1' => { name: 'Bob', email: bob_email, role: :student,
                     phantom: false, timeline_algorithm: :fixed, external_id: 'freed-id' } }
        end
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'raises PendingExternalIdUpdates without resolution (Alice has existing ext_id)' do
          expect { invitation_service.invite(invitation_attributes) }.
            to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
        end

        context 'with resolution :replace_all' do
          subject(:result) { invitation_service.invite(invitation_attributes, external_id_resolution: :replace_all) }

          it 'updates Alice to new-id' do
            result
            expect(alice_invitation.reload.external_id).to eq('new-id')
          end

          it 'creates a new invitation for Bob with the freed id' do
            new_invitations, = result
            expect(new_invitations.map(&:external_id)).to include('freed-id')
          end

          it 'produces no failed_users entries' do
            _, _, _, _, failed_users = result
            expect(failed_users).to be_empty
          end
        end
      end

      context 'cross-type freed-id: existing course user frees id, new invitation claims it in same batch' do
        # invite_new_users runs before add_existing_users, so the new invitation is processed
        # first and sees the id as still taken. The existing course user is then updated
        # successfully, but the new invitation has already been rejected.
        let!(:enrolled_user_freeing) { create(:user) }
        let!(:course_user_freeing) do
          create(:course_student, course: course, user: enrolled_user_freeing, external_id: 'freed-id')
        end
        let(:new_user_email) { generate(:email) }
        let(:invitation_attributes) do
          { '0' => { name: enrolled_user_freeing.name, email: enrolled_user_freeing.email,
                     role: :student, phantom: false, timeline_algorithm: :fixed,
                     external_id: 'new-id' },
            '1' => { name: 'New Person', email: new_user_email,
                     role: :student, phantom: false, timeline_algorithm: :fixed,
                     external_id: 'freed-id' } }
        end
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'raises PendingExternalIdUpdates without resolution' do
          expect { invitation_service.invite(invitation_attributes) }.
            to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
        end

        context 'with resolution :replace_all' do
          subject(:result) { invitation_service.invite(invitation_attributes, external_id_resolution: :replace_all) }

          it 'updates the existing course user to new-id' do
            result
            expect(course_user_freeing.reload.external_id).to eq('new-id')
          end

          it 'rejects the new invitation because it is processed before the id is freed' do
            _, _, _, _, failed_users = result
            expect(failed_users.map { |u| u[:email] }).to include(new_user_email)
            expect(failed_users.find { |u| u[:email] == new_user_email }[:reason]).to eq(:external_id_taken)
          end
        end
      end

      context 'when a new direct enrollee (existing account, not yet in course) ' \
              'has an ext_id already taken by another course member' do
        let!(:other_member) { create(:course_student, course: course, external_id: 'taken-id') }
        let!(:enrollee) { create(:instance_user).user }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        subject(:result) do
          invitation_service.invite(
            { '0' => { name: enrollee.name, email: enrollee.email, role: :student,
                       phantom: false, timeline_algorithm: :fixed, external_id: 'taken-id' } }
          )
        end

        it 'puts the enrollee in failed_users with :external_id_taken' do
          _, _, _, _, failed_users = result
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
        end

        it 'does not enroll the user' do
          _, _, new_course_users, = result
          expect(new_course_users).to be_empty
        end

        it 'does not create an invitation' do
          new_invitations, = result
          expect(new_invitations).to be_empty
        end
      end

      context 'when a new invitation ext_id conflicts with a course user ext_id (not a pending invitation)' do
        let!(:existing_member) { create(:course_student, course: course, external_id: 'cu-taken-id') }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'puts the row in failed_users with :external_id_taken and does not create an invitation' do
          result = invitation_service.invite(
            { '0' => { name: 'New Person', email: generate(:email), role: :student,
                       phantom: false, timeline_algorithm: :fixed, external_id: 'cu-taken-id' } }
          )
          new_invitations, _, _, _, failed_users = result
          expect(failed_users.size).to eq(1)
          expect(failed_users.first[:reason]).to eq(:external_id_taken)
          expect(new_invitations).to be_empty
        end
      end

      context 'when the email belongs to a user with an unconfirmed email address' do
        let!(:unconfirmed_user) { create(:instance_user).user }
        before { unconfirmed_user.emails.update_all(confirmed_at: nil) }
        let(:invitation_service) { Course::UserInvitationService.new(course_user, user, course) }

        it 'sends an invitation instead of directly enrolling the user' do
          result = invitation_service.invite(
            { '0' => { name: unconfirmed_user.name, email: unconfirmed_user.email,
                       role: :student, phantom: false, timeline_algorithm: :fixed, external_id: nil } }
          )
          new_invitations, _, new_course_users, = result
          expect(new_invitations.size).to eq(1)
          expect(new_course_users).to be_empty
        end
      end

      context 'CSV batch duplicate scenarios' do
        def csv_with_timeline(entries)
          Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |csv|
              csv << ['Name', 'Email', 'External ID', 'Role', 'Phantom', 'Personal Timeline']
              entries.each do |e|
                csv << [e[:name], e[:email], e[:external_id],
                        e.fetch(:role, 'student'), e.fetch(:phantom, 'false'), e.fetch(:timeline, 'fixed')]
              end
            end)
            file.rewind
          end
        end

        context 'when a CSV has two rows with the same email' do
          it 'puts the second in failedUsers with reason duplicate_email' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'id-1' },
                                      { name: 'User B', email: 'a@example.com', external_id: 'id-2' }
                                    ])
            result = subject.invite(csv)
            _new_invitations, _existing, _new_cu, _existing_cu, failed_users = result
            expect(failed_users.size).to eq(1)
            expect(failed_users.first[:reason]).to eq(:duplicate_email_in_file)
            csv.close!
          end
        end

        context 'when a CSV has two rows with the same external_id' do
          it 'puts the second in failedUsers with reason duplicate_external_id' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'shared-id' },
                                      { name: 'User B', email: 'b@example.com', external_id: 'shared-id' }
                                    ])
            result = subject.invite(csv)
            _new_invitations, _existing, _new_cu, _existing_cu, failed_users = result
            expect(failed_users.size).to eq(1)
            expect(failed_users.first[:reason]).to eq(:duplicate_external_id_in_file)
            csv.close!
          end
        end

        context 'when a CSV row has a course-duplicate email AND a batch-duplicate external_id' do
          let(:enrolled_user) { create(:instance_user).user }
          let!(:course_student) { create(:course_student, course: course, user: enrolled_user) }

          it 'passes the enrolled user through to the process phase (not a CSV-level dedup failure)' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'shared-id' },
                                      { name: 'Enrolled', email: enrolled_user.email, external_id: 'shared-id' }
                                    ])
            result = subject.invite(csv)
            expect(result).not_to be_nil
            _new_invitations, _existing, _new_cu, _existing_cu, failed_users = result
            expect(failed_users.size).to eq(1)
            # The enrolled user reaches the DB-aware process phase and fails there because
            # User A already claimed the external ID — not a CSV-level duplicate.
            expect(failed_users.first[:reason]).to eq(:external_id_taken)
            csv.close!
          end

          it 'enrolled user re-uploaded with their own current external_id succeeds' do
            course_student.update!(external_id: 'my-id')
            csv = csv_with_timeline([
                                      { name: 'Other', email: 'other@example.com', external_id: 'other-id' },
                                      { name: 'Enrolled', email: enrolled_user.email, external_id: 'my-id' }
                                    ])
            result = subject.invite(csv)
            expect(result).not_to be_nil
            _new_invitations, _existing, _new_cu, existing_cu, failed_users = result
            expect(failed_users).to be_empty
            expect(existing_cu.map(&:user)).to include(enrolled_user)
            csv.close!
          end
        end

        context 'when a CSV row duplicates both email and external_id within the batch' do
          it 'is caught as a duplicate_email (email is checked first)' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'id-1' },
                                      { name: 'User B', email: 'a@example.com', external_id: 'id-1' }
                                    ])
            result = subject.invite(csv)
            _new_invitations, _existing, _new_cu, _existing_cu, failed_users = result
            expect(failed_users.size).to eq(1)
            expect(failed_users.first[:reason]).to eq(:duplicate_email_in_file)
            csv.close!
          end
        end
      end

      context 'when pre-loading taken external_ids' do
        let!(:enrolled) { create(:course_student, course: course, external_id: 'enrolled-id') }
        let!(:pending_inv) { create(:course_user_invitation, course: course, external_id: 'pending-id') }
        let(:invitation_attributes) do
          { '0' => { name: 'A', email: generate(:email), role: :student, phantom: false,
                     timeline_algorithm: :fixed, external_id: 'new-id' } }
        end

        it 'does not treat a new unique external_id as taken' do
          result = subject.invite(invitation_attributes)
          expect(result).not_to be_nil
          new_invitations, _, _, _, failed_users = result
          expect(new_invitations.length).to eq(1)
          expect(failed_users).to be_empty
        end
      end

      context 'when an invalid email is specified' do
        let(:invalid_user_attributes) do
          [name: build(:user).name, email: 'xxnot an email', role: :student]
        end

        it 'fails' do
          expect(invite).to be_falsey
        end

        it 'does not send any notifications', type: :mailer do
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

    describe 'timeline_algorithm assignment on direct enrollment' do
      let(:course) { create(:course, default_timeline_algorithm: :fixed) }
      let(:manager) { create(:course_manager, course: course) }
      let(:existing_user) { create(:instance_user).user }
      subject { Course::UserInvitationService.new(manager, manager.user, course) }

      it 'assigns the CSV timeline_algorithm to the enrolled CourseUser, not the course default' do
        result = subject.invite(
          { '0' => { name: existing_user.name, email: existing_user.email,
                     role: :student, phantom: false, timeline_algorithm: :otot, external_id: nil } }
        )
        _, _, new_course_users, = result
        expect(new_course_users.size).to eq(1)
        expect(new_course_users.first.timeline_algorithm).to eq('otot')
      end
    end

    describe 'ext_id handling on existing records' do
      let(:course) { create(:course) }
      let(:manager) { create(:course_manager, course: course) }
      subject { Course::UserInvitationService.new(manager, manager.user, course) }

      # An existing pending invitation with nil ext_id; CSV provides EXT001 (free)
      let!(:existing_inv_nil_ext) { create(:course_user_invitation, course: course, external_id: nil) }
      let(:inv_nil_ext_user_attrs) do
        { '0' => { name: existing_inv_nil_ext.name, email: existing_inv_nil_ext.email,
                   role: :student, phantom: false, timeline_algorithm: :fixed, external_id: 'EXT001' } }
      end

      # Another invitation that already holds 'TAKEN' so EXT_TAKEN is not free
      let!(:other_inv) { create(:course_user_invitation, course: course, external_id: 'TAKEN') }
      # An existing pending invitation with nil ext_id; CSV provides TAKEN (already in DB)
      let!(:existing_inv_taken_ext) { create(:course_user_invitation, course: course, external_id: nil) }
      let(:inv_taken_ext_user_attrs) do
        { '0' => { name: existing_inv_taken_ext.name, email: existing_inv_taken_ext.email,
                   role: :student, phantom: false, timeline_algorithm: :fixed, external_id: 'TAKEN' } }
      end

      # An existing enrolled course user with nil ext_id; CSV provides EXT002 (free)
      let!(:enrolled_nil) { create(:course_student, course: course, external_id: nil) }
      let(:enrolled_nil_user_attrs) do
        { '0' => { name: enrolled_nil.name, email: enrolled_nil.user.email,
                   role: :student, phantom: false, timeline_algorithm: :fixed, external_id: 'EXT002' } }
      end

      # An existing enrolled course user with ext_id 'EXISTING'; CSV provides 'DIFFERENT'
      let!(:enrolled_conflict) { create(:course_student, course: course, external_id: 'EXISTING') }
      let(:enrolled_conflict_user_attrs) do
        { '0' => { name: enrolled_conflict.name, email: enrolled_conflict.user.email,
                   role: :student, phantom: false, timeline_algorithm: :fixed, external_id: 'DIFFERENT' } }
      end

      it 'raises PendingExternalIdUpdates when existing invitation has nil ext_id and CSV value is free' do
        expect { subject.invite(inv_nil_ext_user_attrs) }.
          to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
      end

      it 'sets ext_id on existing invitation when current is nil and CSV value is free with :replace_all' do
        result = subject.invite(inv_nil_ext_user_attrs, external_id_resolution: :replace_all)
        expect(result).not_to be_nil
        updated_invitations = result[5]
        expect(updated_invitations.length).to eq(1)
        expect(updated_invitations.map { |u| u[:record] }.first.external_id).to eq('EXT001')
        expect(existing_inv_nil_ext.reload.external_id).to eq('EXT001')
      end

      it 'rejects with :external_id_taken when existing invitation has nil ext_id but CSV value is taken' do
        result = subject.invite(inv_taken_ext_user_attrs)
        expect(result).not_to be_nil
        failed_users = result[4]
        expect(failed_users.map { |u| u[:reason] }).to include(:external_id_taken)
      end

      it 'raises PendingExternalIdUpdates when existing course user has nil ext_id and CSV value is free' do
        expect { subject.invite(enrolled_nil_user_attrs) }.
          to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
      end

      it 'sets ext_id on existing course user when current is nil and CSV value is free with :replace_all' do
        result = subject.invite(enrolled_nil_user_attrs, external_id_resolution: :replace_all)
        expect(result).not_to be_nil
        updated_course_users = result[6]
        expect(updated_course_users.length).to eq(1)
        expect(updated_course_users.map { |u| u[:record] }.first.external_id).to eq('EXT002')
        expect(enrolled_nil.reload.external_id).to eq('EXT002')
      end

      context 'when an existing course user has non-nil ext_id and CSV provides a free different value' do
        it 'raises PendingExternalIdUpdates without resolution' do
          expect { subject.invite(enrolled_conflict_user_attrs) }.
            to raise_error(Course::UserInvitationService::PendingExternalIdUpdates)
        end

        it 'updates the course_user external_id with resolution :replace_all' do
          subject.invite(enrolled_conflict_user_attrs, external_id_resolution: :replace_all)
          expect(enrolled_conflict.reload.external_id).to eq('DIFFERENT')
        end

        it 'puts the user in updated_course_users with resolution :replace_all' do
          result = subject.invite(enrolled_conflict_user_attrs, external_id_resolution: :replace_all)
          updated_course_users = result[6]
          expect(updated_course_users.map { |u| u[:record] }).to include(enrolled_conflict)
        end

        it 'captures the previous ext_id with resolution :replace_all' do
          result = subject.invite(enrolled_conflict_user_attrs, external_id_resolution: :replace_all)
          updated_course_users = result[6]
          entry = updated_course_users.find { |u| u[:record] == enrolled_conflict }
          expect(entry[:previous_external_id]).to eq('EXISTING')
        end

        it 'produces no failed_users entry with resolution :replace_all' do
          result = subject.invite(enrolled_conflict_user_attrs, external_id_resolution: :replace_all)
          _, _, _, _, failed_users = result
          expect(failed_users).to be_empty
        end
      end
    end

    describe '#resend_invitation' do
      let(:previous_sent_time) { 1.day.ago }
      let(:pending_invitations) do
        create_list(:course_user_invitation, 3, course: course, sent_at: previous_sent_time)
      end

      with_active_job_queue_adapter(:test) do
        it 'sends an email to everyone', type: :mailer do
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

    describe '#parse_from_file' do
      subject { stubbed_user_invitation_service }
      let(:temp_csv) { temp_csv_from_attributes(users, roles, timeline_algorithms) }
      after { temp_csv.close! }

      # --- file format edge cases (mode-agnostic) ---

      context 'when the provided file is invalid' do
        it 'raises an exception' do
          expect do
            subject.send(:parse_from_file, file_fixture('course/invitation_invalid.csv'))
          end.to raise_exception(CSV::MalformedCSVError)
        end
      end

      context 'when the provided file is encoded with UTF-8 with byte order marks' do
        let(:csv_file) { file_fixture('course/invitation_with_utf_bom.csv') }

        it 'removes the unnecessary characters' do
          result = subject.send(:parse_from_file, csv_file)
          result.each do |invitation|
            expect(invitation[:name].match("\xEF\xBB\xBF")).to be_nil
          end
        end
      end

      context 'when the provided file has whitespace in the fields' do
        before { course.update!(show_personalized_timeline_features: false) }
        let(:csv_file) { file_fixture('course/invitation_whitespace.csv') }

        it 'strips the attributes of whitespace' do
          result = subject.send(:parse_from_file, csv_file)
          result.each do |attr|
            expect(attr[:name]).to eq(attr[:name].strip)
            expect(attr[:email]).to eq(attr[:email].strip)
          end
        end
      end

      context 'when the provided csv file has blanks' do
        before { course.update!(show_personalized_timeline_features: false) }
        subject do
          stubbed_user_invitation_service.
            send(:parse_from_file, file_fixture('course/invitation_empty.csv'))
        end

        it 'does not raise an exception' do
          expect { subject }.not_to raise_exception
        end

        it 'ignores blank entries and invites users with both name and emails or emails only' do
          # Empty invitation CSV only has 1 full entry and 1 entry only with email
          expect(subject.flatten.count).to eq(2)
        end
      end

      context 'when the provided csv file has no header' do
        subject do
          stubbed_user_invitation_service.
            send(:parse_from_file, file_fixture('course/invitation_no_header.csv'))
        end

        before { course.update!(show_personalized_timeline_features: false) }

        it 'raises invalid_headers (headerless CSVs are rejected)' do
          expect { subject }.to raise_error(CSV::MalformedCSVError)
        end
      end

      context 'when a blank-header column has data in data rows' do
        before { course.update!(show_personalized_timeline_features: false) }

        it 'proceeds and sets blank_header_warning to true' do
          csv_content = "Name,Email,,Role\n" \
                        "Alice,alice@example.com,mystery_data,student\n"
          Tempfile.create(['blank_header_with_data', '.csv']) do |f|
            f.write(csv_content)
            f.rewind
            stubbed_user_invitation_service.send(:parse_from_file, f)
            expect(stubbed_user_invitation_service.blank_header_warning).to be true
          end
        end
      end

      context 'when a blank-header column has no data (trailing spreadsheet artifact)' do
        before { course.update!(show_personalized_timeline_features: false) }

        it 'proceeds with blank_header_warning false' do
          csv_content = "Name,Email,\n" \
                        "Alice,alice@example.com,\n"
          Tempfile.create(['blank_header_empty', '.csv']) do |f|
            f.write(csv_content)
            f.rewind
            stubbed_user_invitation_service.send(:parse_from_file, f)
            expect(stubbed_user_invitation_service.blank_header_warning).to be false
          end
        end
      end

      # --- timeline-aware parsing ---

      context 'when personal timelines are enabled' do
        before { course.update!(show_personalized_timeline_features: true) }

        context 'Phase 3 header acceptance — with timeline' do
          it 'accepts canonical EN header' do
            csv_content = "Name,Email,External ID,Role,Phantom,Personal Timeline\n" \
                          "Alice,alice@example.com,EXT001,student,false,fixed\n"
            Tempfile.create(['p3_en_timeline', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
              expect(result[0][:timeline_algorithm]).to eq(:fixed)
            end
          end

          it 'accepts canonical ZH header' do
            csv_content = "姓名,电子邮件,外部编号,角色,旁听学生,个人时间线\n" \
                          "Alice,alice@example.com,EXT001,student,false,fixed\n"
            Tempfile.create(['p3_zh_timeline', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts canonical KO header' do
            csv_content = "이름,이메일,외부 ID,역할,팬텀,개인 타임라인\n" \
                          "Alice,alice@example.com,EXT001,student,false,fixed\n"
            Tempfile.create(['p3_ko_timeline', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts mixed-language header' do
            csv_content = "姓名,Email,외부 ID,Role,旁听学生,Personal Timeline\n" \
                          "Alice,alice@example.com,EXT001,student,false,fixed\n"
            Tempfile.create(['p3_mixed', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
            end
          end

          it 'parses correctly regardless of column order' do
            csv_content = "Personal Timeline,External ID,Email,Role,Name,Phantom\n" \
                          "fixed,EXT001,alice@example.com,student,Alice,false\n"
            Tempfile.create(['p3_shuffled', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
              expect(result[0][:name]).to eq('Alice')
              expect(result[0][:timeline_algorithm]).to eq(:fixed)
            end
          end

          it 'raises invalid_headers for headerless CSV' do
            Tempfile.create(['p3_no_header', '.csv']) do |f|
              f.write("Alice,alice@example.com,EXT001,student,false,fixed\n")
              f.rewind
              expect { stubbed_user_invitation_service.send(:parse_from_file, f) }.
                to raise_error(CSV::MalformedCSVError)
            end
          end

          it 'includes accepted headers in UI locale in the error message' do
            Tempfile.create(['p3_err_locale', '.csv']) do |f|
              f.write("bad,headers\n")
              f.rewind
              expect { stubbed_user_invitation_service.send(:parse_from_file, f) }.
                to raise_error(CSV::MalformedCSVError, /External ID/)
            end
          end

          it 'accepts a CSV with only name and email columns' do
            Tempfile.create(['p3_name_email_only', '.csv']) do |f|
              f.write("Name,Email\nAlice,alice@example.com\n")
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:name]).to eq('Alice')
              expect(result[0][:email]).to eq('alice@example.com')
              expect(result[0][:role]).to eq(:student)
              expect(result[0][:phantom]).to eq(false)
            end
          end

          it 'raises missing_required_headers when email column is absent' do
            Tempfile.create(['p3_no_email', '.csv']) do |f|
              f.write("Name\nAlice\n")
              f.rewind
              expect { stubbed_user_invitation_service.send(:parse_from_file, f) }.
                to raise_error(CSV::MalformedCSVError)
            end
          end

          it 'raises missing_required_headers when name column is absent' do
            Tempfile.create(['p3_no_name', '.csv']) do |f|
              f.write("Email\nalice@example.com\n")
              f.rewind
              expect { stubbed_user_invitation_service.send(:parse_from_file, f) }.
                to raise_error(CSV::MalformedCSVError)
            end
          end
        end

        it 'silently skips blank-header columns and parses remaining columns correctly' do
          Tempfile.create(['blank_header_col', '.csv']) do |f|
            f.write("Name,,Email\nAlice,,alice@example.com\n")
            f.rewind
            result = stubbed_user_invitation_service.send(:parse_from_file, f)
            expect(result.length).to eq(1)
            expect(result[0][:name]).to eq('Alice')
            expect(result[0][:email]).to eq('alice@example.com')
          end
        end

        it 'accepts a file with name/header' do
          result = subject.send(:parse_from_file, temp_csv)
          expect(result.length).to eq(users.length)
        end

        it 'calls #invite_users with appropriate user attributes' do
          result = subject.send(:parse_from_file, temp_csv)
          expect(result).to eq(user_attributes)
        end

        context 'when the provided file has no roles' do
          let(:temp_csv_without_role) { temp_csv_from_attributes(users) }
          after { temp_csv_without_role.close! }

          it 'defaults the role to student' do
            result = subject.send(:parse_from_file, temp_csv_without_role)
            result.each do |attr|
              expect(attr[:role]).to eq(:student)
            end
          end
        end

        context 'when the csv file has slightly invalid role/phantom/timeline algorithm specifications' do
          subject do
            stubbed_user_invitation_service.
              send(:parse_from_file, file_fixture('course/invitation_fuzzy_roles_phantom_timeline.csv'))
          end

          it 'defaults blank role column to student' do
            expect(subject[0][:role]).to eq(:student)
          end

          it 'defaults blank phantom to false' do
            expect(subject[0][:phantom]).to be_falsey
          end

          it 'defaults blank timeline algorithm to course default (fixed)' do
            expect(subject[0][:timeline_algorithm]).to eq('fixed')
          end

          it 'parses roles correctly anyway' do
            expect(subject[1][:role]).to eq(:teaching_assistant)
            expect(subject[2][:role]).to eq(:manager)
            expect(subject[3][:role]).to eq(:owner)
            expect(subject[4][:role]).to eq(:observer)
            expect(subject[5][:role]).to eq(:teaching_assistant)
          end

          it 'parses phantom columns correctly anyway' do
            expect(subject[1][:phantom]).to be_falsey
            (6..8).each do |i|
              expect(subject[i][:phantom]).to be_truthy
            end
          end

          it 'parses timeline algorithms correctly anyway' do
            expect(subject[1][:timeline_algorithm]).to eq(:stragglers)
            expect(subject[2][:timeline_algorithm]).to eq(:otot)
            expect(subject[3][:timeline_algorithm]).to eq(:fomo)
            expect(subject[4][:timeline_algorithm]).to eq(:fixed)
          end
        end

        context 'when no timeline algorithm column is present' do
          let(:temp_csv_without_timeline) { temp_csv_from_attributes(users) }
          after { temp_csv_without_timeline.close! }

          context 'when the course default is fomo' do
            before { course.update!(default_timeline_algorithm: 'fomo') }

            it 'defaults the timeline algorithm to fomo' do
              result = subject.send(:parse_from_file, temp_csv_without_timeline)
              result.each do |attr|
                expect(attr[:timeline_algorithm]).to eq('fomo')
              end
            end
          end

          context 'when the course default is stragglers' do
            before { course.update!(default_timeline_algorithm: 'stragglers') }

            it 'defaults the timeline algorithm to stragglers' do
              result = subject.send(:parse_from_file, temp_csv_without_timeline)
              result.each do |attr|
                expect(attr[:timeline_algorithm]).to eq('stragglers')
              end
            end
          end

          context 'when the course default is otot' do
            before { course.update!(default_timeline_algorithm: 'otot') }

            it 'defaults the timeline algorithm to otot' do
              result = subject.send(:parse_from_file, temp_csv_without_timeline)
              result.each do |attr|
                expect(attr[:timeline_algorithm]).to eq('otot')
              end
            end
          end
        end

        context 'when the csv has an external_id column' do
          subject do
            stubbed_user_invitation_service.
              send(:parse_from_file, file_fixture('course/invitation_with_external_id.csv'))
          end

          it 'parses external_id from col 6 correctly' do
            expect(subject[0][:external_id]).to eq('EXT001')
            expect(subject[1][:external_id]).to eq('EXT002')
          end

          it 'sets external_id to nil when blank' do
            expect(subject[2][:external_id]).to be_nil
          end
        end

        context 'when the csv has no external_id column' do
          let(:csv_without_external_id) { file_fixture('course/invitation_fuzzy_roles_phantom_timeline.csv') }

          it 'sets external_id to nil for all rows' do
            result = stubbed_user_invitation_service.send(:parse_from_file, csv_without_external_id)
            result.each do |attr|
              expect(attr[:external_id]).to be_nil
            end
          end
        end

        context 'when the csv header uses unrecognized column names' do
          it 'raises an error for the unrecognized header' do
            expect do
              stubbed_user_invitation_service.
                send(:parse_from_file, file_fixture('course/invitation_unrecognized_header.csv'))
            end.to raise_error(CSV::MalformedCSVError)
          end
        end
      end

      context 'when personal timelines are disabled' do
        before { course.update!(show_personalized_timeline_features: false) }

        context 'Phase 3 header acceptance — without timeline' do
          it 'accepts canonical EN header (no timeline)' do
            csv_content = "Name,Email,External ID,Role,Phantom\n" \
                          "Alice,alice@example.com,EXT001,student,false\n"
            Tempfile.create(['p3_en_notimeline', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts canonical ZH header (no timeline)' do
            csv_content = "姓名,电子邮件,外部编号,角色,旁听学生\n" \
                          "Alice,alice@example.com,EXT001,student,false\n"
            Tempfile.create(['p3_zh_notimeline', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts canonical KO header (no timeline)' do
            csv_content = "이름,이메일,외부 ID,역할,팬텀\n" \
                          "Alice,alice@example.com,EXT001,student,false\n"
            Tempfile.create(['p3_ko_notimeline', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts timeline-format CSV even when the course has timelines disabled' do
            csv_content = "Name,Email,External ID,Role,Phantom,Personal Timeline\n" \
                          "Alice,alice@example.com,EXT001,student,false,otot\n"
            Tempfile.create(['p3_timeline_on_notime', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
            end
          end

          it 'raises invalid_headers for headerless CSV (no timeline)' do
            Tempfile.create(['p3_no_header_notime', '.csv']) do |f|
              f.write("Alice,alice@example.com,EXT001,student,false\n")
              f.rewind
              expect { stubbed_user_invitation_service.send(:parse_from_file, f) }.
                to raise_error(CSV::MalformedCSVError)
            end
          end

          it 'accepts external_id header spelled with underscore instead of space' do
            csv_content = "Name,Email,external_id,Role,Phantom\n" \
                          "Alice,alice@example.com,EXT001,student,false\n"
            Tempfile.create(['p3_ext_underscore', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts external_id header spelled with no separator (externalid)' do
            csv_content = "Name,Email,externalid,Role,Phantom\n" \
                          "Alice,alice@example.com,EXT001,student,false\n"
            Tempfile.create(['p3_ext_nospace', '.csv']) do |f|
              f.write(csv_content)
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:external_id]).to eq('EXT001')
            end
          end

          it 'accepts headers in any casing' do
            Tempfile.create(['p3_uppercase', '.csv']) do |f|
              f.write("NAME,EMAIL\nAlice,alice@example.com\n")
              f.rewind
              result = stubbed_user_invitation_service.send(:parse_from_file, f)
              expect(result.length).to eq(1)
              expect(result[0][:name]).to eq('Alice')
              expect(result[0][:email]).to eq('alice@example.com')
            end
          end
        end

        context 'when the csv has an external_id column' do
          subject do
            stubbed_user_invitation_service.
              send(:parse_from_file, file_fixture('course/invitation_with_external_id_no_timeline.csv'))
          end

          it 'parses external_id from col 5 correctly' do
            expect(subject[0][:external_id]).to eq('EXT001')
            expect(subject[1][:external_id]).to eq('EXT002')
          end

          it 'sets external_id to nil when blank' do
            expect(subject[2][:external_id]).to be_nil
          end

          it 'auto-fills timeline_algorithm with course default' do
            result = stubbed_user_invitation_service.send(
              :parse_from_file,
              file_fixture('course/invitation_with_external_id_no_timeline.csv')
            )
            result.each do |attr|
              expect(attr[:timeline_algorithm]).to eq(course.default_timeline_algorithm)
            end
          end
        end

        context 'when the csv has no external_id column' do
          subject do
            stubbed_user_invitation_service.
              send(:parse_from_file, file_fixture('course/invitation_no_external_id_no_timeline.csv'))
          end

          it 'sets external_id to nil for all rows' do
            subject.each do |attr|
              expect(attr[:external_id]).to be_nil
            end
          end
        end
      end
    end

    describe 'template guard' do
      it 'accepts every static invite template with the parser' do
        template_dir = Rails.root.join('client/app/assets/templates')
        Dir.glob(template_dir.join('course-user-invitation-template*.csv')).each do |path|
          include_timeline = !path.include?('no-timeline')
          course.update!(show_personalized_timeline_features: include_timeline)

          expect do
            stubbed_user_invitation_service.send(:parse_from_file, path)
          end.not_to raise_error, "Template #{File.basename(path)} failed parser validation"
        end
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
          user_form_attributes.transform_values do |v|
            v.except(:name)
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
      context 'when users already exist in the current instance' do
        it 'immediately adds users' do
          subject.send(:invite_users, temp_csv_from_attributes(existing_users, existing_roles))
          existing_users.each do |user|
            found_user = course.course_users.find { |course_user| course_user.user == user }
            expect(found_user).not_to be_nil
            expect(found_user.timeline_algorithm).to eq('fixed') # default value
          end
        end

        it 'does not create duplicate instance users' do
          subject.send(:invite_users, temp_csv_from_attributes(existing_users, existing_roles))
          expect(instance.instance_users.pluck(:user_id)).to match_array([user.id] + existing_users.map(&:id))
        end

        context 'when a user has requested to enrol to the course' do
          let!(:enrol_request) { create(:course_enrol_request, course: course, user: existing_users.first) }
          it 'removes the enrolment request' do
            subject.send(:invite_users, temp_csv_from_attributes(existing_users, existing_roles))
            expect(course.enrol_requests.length).to eq(0)
          end
        end

        context 'when provided emails are capitalised' do
          let(:modified_existing_users) do
            existing_users.each { |user| user.email = user.email.upcase }
          end

          it 'adds the correct users' do
            subject.send(:invite_users,
                         temp_csv_from_attributes(modified_existing_users, existing_roles))
            existing_users.each do |user|
              found_user = course.course_users.find { |course_user| course_user.user == user }
              expect(found_user).not_to be_nil
            end
          end
        end

        context 'when users already exist in the current instance and \
          default course timeline setting is fomo' do
          before do
            course.update!(default_timeline_algorithm: 'fomo')
          end
          it 'sets the timeline algorithm for the users to fomo' do
            subject.send(:invite_users, temp_csv_from_attributes(existing_users, existing_roles))
            existing_users.each do |user|
              found_user = course.course_users.find { |course_user| course_user.user == user }
              expect(found_user.timeline_algorithm).to eq('fomo')
            end
          end
        end

        context 'when users already exist in the current instance and \
          default course timeline setting is stragglers' do
          before do
            course.update!(default_timeline_algorithm: 'stragglers')
          end
          it 'sets the timeline algorithm for the users to stragglers' do
            subject.send(:invite_users, temp_csv_from_attributes(existing_users, existing_roles))
            existing_users.each do |user|
              found_user = course.course_users.find { |course_user| course_user.user == user }
              expect(found_user.timeline_algorithm).to eq('stragglers')
            end
          end
        end

        context 'when users already exist in the current instance and \
          default course timeline setting is otot' do
          before do
            course.update!(default_timeline_algorithm: 'otot')
          end
          it 'sets the timeline algorithm for the users to otot' do
            subject.send(:invite_users, temp_csv_from_attributes(existing_users, existing_roles))
            existing_users.each do |user|
              found_user = course.course_users.find { |course_user| course_user.user == user }
              expect(found_user.timeline_algorithm).to eq('otot')
            end
          end
        end
      end

      context 'when users exist in a different instance' do
        let(:other_instance) { create(:instance) }
        let(:users_from_other_instance) do
          ActsAsTenant.with_tenant(other_instance) do
            (1..3).map { create(:instance_user).user }
          end
        end

        it 'creates course users for them' do
          ActsAsTenant.with_tenant(instance) do
            subject.send(:invite_users, temp_csv_from_attributes(users_from_other_instance, new_roles))
            users_from_other_instance.each do |user|
              found_user = course.course_users.find { |course_user| course_user.user == user }
              expect(found_user).not_to be_nil
            end
          end
        end

        it 'creates normal instance users for them' do
          ActsAsTenant.with_tenant(instance) do
            subject.send(:invite_users, temp_csv_from_attributes(users_from_other_instance, new_roles))

            expect(
              instance.instance_users.pluck(:user_id)
            ).to match_array([user.id] + users_from_other_instance.map(&:id))

            users_from_other_instance.each do |user|
              instance_user = instance.instance_users.find_by(user: user)
              expect(instance_user).not_to be_nil
              expect(instance_user.role).to eq('normal')
            end
          end
        end
      end

      context 'when users do not exist in the current instance' do
        it 'sends the invitations' do
          subject.send(:invite_users, temp_csv_from_attributes(new_users, new_roles))
          new_users.each do |user|
            expect(course.invitations.any? do |invitation|
              invitation.email == user.email
            end).to be_truthy
          end
        end
      end

      context 'when no roles are specified' do
        let(:all_users) { existing_users + new_users }

        it 'defaults to :student for roles' do
          result_new, _, result_existing =
            subject.send(:invite_users, temp_csv_from_attributes(all_users))
          (result_new + result_existing).each do |invitee|
            expect(invitee.student?).to be_truthy
          end
        end
      end

      context 'when teaching assistant invites roles other than student' do
        let(:course_user) { create(:course_teaching_assistant, course: course) }
        let(:all_users) { existing_users + new_users }

        it 'defaults to :student for roles' do
          result_new, _, result_existing =
            subject.send(:invite_users, temp_csv_from_attributes(all_users, roles))
          (result_new + result_existing).each do |invitee|
            expect(invitee.student?).to be_truthy
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
          result = subject.send(:find_existing_users, ["foo#{user.email}"])
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
        subject.instance_variable_set(:@failed_users, [])
        subject.instance_variable_set(:@taken_external_ids, Set.new)
        subject.send(:invite_new_users, invitation_params)
        invitation_params.each do |hash|
          invitation = course.invitations.find { |i| i.name == hash[:name] }
          expect(invitation.email).to eq(hash[:email])
        end
      end
    end
  end
end
