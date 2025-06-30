# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AggregateController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:course_user) { create(:course_user, role: :teaching_assistant, course: course) }

    describe '#all_staff' do
      subject { get :all_staff, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#all_students' do
      subject { get :all_students, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#course_progression' do
      subject { get :course_progression, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#course_performance' do
      subject { get :course_performance, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#all_assessments' do
      render_views
      let!(:assessment) do
        create(:assessment, :published,
               :with_all_question_types, course: course, end_at: 1.hour.from_now)
      end

      let!(:unpublished_assessment) { create(:assessment, :with_all_question_types, course: course) }

      let!(:students) { create_list(:course_student, 3, course: course) }

      let!(:attempting_submission) do
        create(:submission, :attempting, assessment: assessment, creator: students[0].user)
      end

      let!(:submitted_submission) do
        create(:submission, :submitted,
               assessment: assessment, creator: students[1].user, submitted_at: Time.now)
      end

      let!(:late_submission) do
        create(:submission, :submitted,
               assessment: assessment, creator: students[2].user, submitted_at: 2.hours.from_now)
      end

      subject { get :all_assessments, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'expects to render all published assessments' do
          expect(subject).to be_successful
          json_result = JSON.parse(response.body)

          expect(json_result['assessments'].count).to eq(1)

          expect(json_result['assessments'][0]['numAttempted']).to eq(3)
          expect(json_result['assessments'][0]['numSubmitted']).to eq(2)
          expect(json_result['assessments'][0]['numLate']).to eq(1)
        end
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#activity_get_help' do
      subject { get :activity_get_help, format: :json, params: { course_id: course } }

      let(:student) { create(:course_student, course: course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:submission) { create(:submission, assessment: assessment, creator: student.user) }
      let(:question) do
        create(:course_assessment_question_programming, assessment: assessment).acting_as
      end
      let(:question_assessment) { create(:question_assessment, assessment: assessment, question: question) }
      let(:submission_question) { create(:submission_question, submission: submission, question: question) }
      let(:thread) do
        create(:live_feedback_thread, assessment: assessment, question: question,
                                      submission_question_id: submission_question.id,
                                      submission_creator_id: student.user.id)
      end
      let!(:messages) do
        create_list(:live_feedback_message, 3, thread: thread)
      end
      render_views

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Owner pings the endpoint' do
        let(:user) { create(:course_owner, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when there are live feedback messages' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns the live feedback messages' do
          expect(subject).to be_successful
          json_response = JSON.parse(response.body)

          expect(json_response).to be_an(Array)
          expect(json_response.length).to eq(1)

          data = json_response.first
          expect(data['lastMessage']).to eq(messages.first.content)
          expect(data['assessmentId']).to eq(assessment.id)
          expect(data['submissionId']).to eq(submission.id)
          expect(data['questionId']).to eq(question.id)
          expect(data['userId']).to eq(student.id)
          expect(data['assessmentTitle']).to eq(assessment.title)
          expect(data['questionTitle']).to eq(question.title)
          expect(data['questionNumber']).to eq(1)
          expect(data['name']).to eq(student.name)
          expect(data['nameLink']).to eq("/courses/#{course.id}/users/#{student.id}")
        end

        context 'when there are multiple messages' do
          let!(:message2) { create(:live_feedback_message, thread: thread, content: 'Still need help!') }

          it 'returns the most recent message' do
            subject
            json_response = JSON.parse(response.body)
            expect(json_response).to include(
              hash_including(
                'lastMessage' => 'Still need help!',
                'messageCount' => 4
              )
            )
          end
        end
      end
    end
  end
end
