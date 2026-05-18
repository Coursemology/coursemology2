# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserInvitationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    def temp_csv_from_attributes(records, roles = [], timeline_algorithms = [])
      Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
        file.write(CSV.generate do |csv|
          csv << [:name, :email, :role]
          records.zip(roles, timeline_algorithms).each do |user, role, timeline_algorithm|
            csv << (role.blank? ? [user.name, user.email] : [user.name, user.email, role, false, timeline_algorithm])
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
          expect(invite.map(&:size)).to eq([new_users.size, 0, existing_users.size, 0, 0])
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
          end)).map(&:size)).to eq([new_users.size, 0, existing_users.size, 0, 0])

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
                                            existing_users.size - users_in_course.size, users_in_course.size, 0])
        end

        with_active_job_queue_adapter(:test) do
          it 'does not send notification to the existing users', type: :mailer do
            expect { invite }.to change { ActionMailer::Base.deliveries.count }.
              by(user_attributes.size - users_invited.size - users_in_course.size)
          end
        end
      end

      context 'when duplicate users are specified' do
        before do
          new_users.push(new_users.last)
        end

        it 'processes duplicate users only once' do
          expect(invite.map(&:size)).to eq([new_user_attributes.size - 1, 0, existing_user_attributes.size, 0, 1])
        end

        it 'tags the duplicate user with a duplicate_email reason' do
          _new_invitations, _existing_invitations, _new_course_users, _existing_course_users, duplicate_users = invite
          expect(duplicate_users.first[:reason]).to eq(:duplicate_email)
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
          new_invitations, _existing_invitations, _new_course_users, _existing_course_users, duplicate_users = result
          expect(new_invitations.size).to eq(1)
          expect(duplicate_users.size).to eq(1)
          expect(duplicate_users.first[:external_id]).to eq('shared-id')
        end

        it 'tags the duplicate user with a duplicate_external_id reason' do
          result = subject.invite(form_attributes)
          _new_invitations, _existing_invitations, _new_course_users, _existing_course_users, duplicate_users = result
          expect(duplicate_users.first[:reason]).to eq(:duplicate_external_id)
        end
      end

      context 'when an invitation has a duplicate external_id matching an existing course user' do
        let!(:existing_course_user) { create(:course_student, course: course, external_id: 'taken-id') }
        let(:form_attributes) do
          { generate(:nested_attribute_new_id) => { name: 'New User', email: generate(:email),
                                                    role: :student, phantom: false,
                                                    external_id: 'taken-id' } }
        end

        it 'returns nil' do
          expect(subject.invite(form_attributes)).to be_nil
        end
      end

      context 'when an invitation has a duplicate external_id matching a pending invitation' do
        let!(:pending_invitation) { create(:course_user_invitation, course: course, external_id: 'taken-id') }
        let(:form_attributes) do
          { generate(:nested_attribute_new_id) => { name: 'New User', email: generate(:email),
                                                    role: :student, phantom: false,
                                                    external_id: 'taken-id' } }
        end

        it 'returns nil' do
          expect(subject.invite(form_attributes)).to be_nil
        end
      end

      context 'when a CSV (with personalized timelines) has a duplicate external_id for an existing course user' do
        let!(:existing_course_user) { create(:course_student, course: course, external_id: 'taken-id') }

        def csv_with_external_id_and_timeline(entries)
          Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |csv|
              entries.each do |entry|
                csv << [entry[:name], entry[:email], 'student', 'false', 'fixed', entry[:external_id]]
              end
            end)
            file.rewind
          end
        end

        it 'returns nil' do
          csv = csv_with_external_id_and_timeline(
            [{ name: 'New User', email: generate(:email), external_id: 'taken-id' }]
          )
          expect(subject.invite(csv)).to be_nil
          csv.close!
        end
      end

      context 'when a CSV (without personalized timelines) has a duplicate external_id for an existing course user' do
        before { course.update!(show_personalized_timeline_features: false) }
        let!(:existing_course_user) { create(:course_student, course: course, external_id: 'taken-id') }

        def csv_with_external_id_no_timeline(entries)
          Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |csv|
              entries.each do |entry|
                csv << [entry[:name], entry[:email], 'student', 'false', entry[:external_id]]
              end
            end)
            file.rewind
          end
        end

        it 'returns nil' do
          csv = csv_with_external_id_no_timeline(
            [{ name: 'New User', email: generate(:email), external_id: 'taken-id' }]
          )
          expect(subject.invite(csv)).to be_nil
          csv.close!
        end
      end

      context 'CSV batch duplicate scenarios' do
        def csv_with_timeline(entries)
          Tempfile.new(File.basename(__FILE__, '.*')).tap do |file|
            file.write(CSV.generate do |csv|
              csv << ['Name', 'Email', 'Role', 'Phantom', 'Timeline', 'ExternalId']
              entries.each do |e|
                csv << [e[:name], e[:email], e.fetch(:role, 'student'),
                        e.fetch(:phantom, 'false'), e.fetch(:timeline, 'fixed'), e[:external_id]]
              end
            end)
            file.rewind
          end
        end

        context 'when a CSV has two rows with the same email' do
          it 'puts the second in duplicateUsers with reason duplicate_email' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'id-1' },
                                      { name: 'User B', email: 'a@example.com', external_id: 'id-2' }
                                    ])
            result = subject.invite(csv)
            _new_invitations, _existing, _new_cu, _existing_cu, duplicate_users = result
            expect(duplicate_users.size).to eq(1)
            expect(duplicate_users.first[:reason]).to eq(:duplicate_email)
            csv.close!
          end
        end

        context 'when a CSV has two rows with the same external_id' do
          it 'puts the second in duplicateUsers with reason duplicate_external_id' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'shared-id' },
                                      { name: 'User B', email: 'b@example.com', external_id: 'shared-id' }
                                    ])
            result = subject.invite(csv)
            _new_invitations, _existing, _new_cu, _existing_cu, duplicate_users = result
            expect(duplicate_users.size).to eq(1)
            expect(duplicate_users.first[:reason]).to eq(:duplicate_external_id)
            csv.close!
          end
        end

        context 'when a CSV row has a course-duplicate email AND a batch-duplicate external_id' do
          let(:enrolled_user) { create(:instance_user).user }
          let!(:course_student) { create(:course_student, course: course, user: enrolled_user) }

          it 'is caught as a batch external_id duplicate and does not fail the batch' do
            csv = csv_with_timeline([
                                      { name: 'User A', email: 'a@example.com', external_id: 'shared-id' },
                                      { name: 'Enrolled', email: enrolled_user.email, external_id: 'shared-id' }
                                    ])
            result = subject.invite(csv)
            expect(result).not_to be_nil
            _new_invitations, _existing, _new_cu, _existing_cu, duplicate_users = result
            expect(duplicate_users.size).to eq(1)
            expect(duplicate_users.first[:reason]).to eq(:duplicate_external_id)
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
            _new_invitations, _existing, _new_cu, _existing_cu, duplicate_users = result
            expect(duplicate_users.size).to eq(1)
            expect(duplicate_users.first[:reason]).to eq(:duplicate_email)
            csv.close!
          end
        end
      end

      context 'when an invalid email is specified' do
        let(:invalid_user_attributes) do
          [{ name: build(:user).name, email: 'xxnot an email', role: :student }]
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

        it 'does not raise an exception' do
          expect { subject }.not_to raise_exception
        end

        it 'invites all users including the first row' do
          # No header CSV has 2 entries
          expect(subject.flatten.count).to eq(2)
        end
      end

      # --- timeline-aware parsing ---

      context 'when personal timelines are enabled' do
        before { course.update!(show_personalized_timeline_features: true) }

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

        context 'when the csv header uses a slightly wrong external_id column name' do
          subject do
            stubbed_user_invitation_service.
              send(:parse_from_file, file_fixture('course/invitation_external_id_wrong_header.csv'))
          end

          it 'still detects and skips the header row' do
            expect(subject.length).to eq(2)
          end

          it 'still parses external_id from col 6 correctly' do
            expect(subject[0][:external_id]).to eq('EXT001')
            expect(subject[1][:external_id]).to eq('EXT002')
          end
        end
      end

      context 'when personal timelines are disabled' do
        before { course.update!(show_personalized_timeline_features: false) }

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
        subject.send(:invite_new_users, invitation_params)
        invitation_params.each do |hash|
          invitation = course.invitations.find { |i| i.name == hash[:name] }
          expect(invitation.email).to eq(hash[:email])
        end
      end
    end
  end
end
