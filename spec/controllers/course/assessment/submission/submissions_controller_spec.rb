# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, *assessment_traits, course: course) }
    let(:assessment2) { create(:assessment, :published, *assessment_traits, course: course) }
    let(:assessment_traits) { [:with_all_question_types] }

    let(:immutable_submission) do
      create(:submission, assessment: assessment, creator: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
        allow(stub).to receive(:update).and_return(false)
        allow(stub).to receive(:destroy).and_return(false)
      end
    end
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:graded_submission) { create(:submission, :graded, assessment: assessment2, creator: user) }
    let(:randomized_assessment) do
      create(:assessment, :published, :with_all_question_types, randomization: 'prepared', course: course).tap do |stub|
        group = stub.question_groups.create!(title: 'Test Group', weight: 1)
        bundle = group.question_bundles.create!(title: 'Test Bundle')
        bundle.question_bundle_questions.create!(question: stub.questions.first, weight: 1)
      end
    end
    let(:randomized_submission) do
      create(:submission, assessment: randomized_assessment, creator: user).tap do |stub|
        randomized_assessment.question_bundles.first.question_bundle_assignments.create(
          user: user,
          assessment: randomized_assessment,
          submission: stub
        )
      end
    end
    let(:answer) { graded_submission.answers.first }

    before { controller_sign_in(controller, user) }

    describe '#index' do
      subject do
        get :index, params: { course_id: course, assessment_id: assessment }
      end

      context 'when a student visits the page' do
        let(:course) { create(:course) }
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      context 'when there is already an existing submission for an assessment' do
        subject do
          post :create, params: { course_id: course, assessment_id: assessment }
        end

        before do
          controller.instance_variable_set(:@submission, submission)
          subject
        end

        it do
          redirect_url = JSON.parse(subject.body)['redirectUrl']
          expect(redirect_url).
            to eq(edit_course_assessment_submission_path(course, assessment, submission))
        end
      end

      # Randomized Assessment is temporarily hidden (PR#5406)
      xcontext 'when a submission of a randomized assesment creation fails' do
        subject do
          post :create, params: { course_id: course, assessment_id: randomized_assessment }
        end

        before do
          subject
        end

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['error']).
            to eq('activerecord.errors.models.course/assessment/submission.no_bundles_assigned')
        end
      end
    end

    describe '#edit' do
      context 'when randomization is nil' do
        render_views
        subject do
          get :edit, params: {
            course_id: course, assessment_id: assessment.id, id: submission.id, format: :json
          }
        end

        it 'renders all questions' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['questions'].count).to eq(7)
        end

        it 'renders the total grade' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['submission']['maximumGrade']).to eq(20)
        end
      end

      context 'when randomization is prepared' do
        render_views
        subject do
          get :edit, params: {
            course_id: course, assessment_id: randomized_assessment.id, id: randomized_submission.id, format: :json
          }
        end

        it 'renders only assigned questions' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['questions'].count).to eq(1)
        end

        it 'renders the total grade for assigned questions' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['submission']['maximumGrade']).to eq(2)
        end
      end
    end

    describe '#update' do
      subject do
        post :update, params: {
          course_id: course, assessment_id: assessment, id: immutable_submission,
          submission: { title: '' }
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@submission, immutable_submission)
          subject
        end

        it { is_expected.to have_http_status(400) }
      end
    end

    describe '#update_grade' do
      subject do
        post :update, params: {
          course_id: course, assessment_id: assessment2, id: graded_submission,
          submission: {
            answers: [{ id: answer.id, grade: grade }]
          },
          format: :json
        }
      end

      context 'when update fails' do
        let(:grade) { nil }
        before do
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when update grade is called, even when answer is not valid' do
        let(:grade) { 0 }
        let(:answer) { graded_submission.answers.third } # programming answer
        let(:max_file_size) { 2.kilobytes }
        let(:invalid_content) { 'a' * (max_file_size + 1) }
        before do
          stub_const('Course::Assessment::Answer::Programming::MAX_TOTAL_FILE_SIZE', max_file_size)
          file = answer.actable.files.first
          file.content = invalid_content
          file.save!(validate: false)
          subject
        end

        it { is_expected.to have_http_status(:ok) }
      end
    end

    describe '#extract_instance_variables' do
      subject do
        get :edit, as: :json, params: { course_id: course, assessment_id: assessment, id: immutable_submission }
      end

      it 'extracts instance variables from services' do
        subject

        expect(controller.instance_variable_get(:@questions_to_attempt)).to be_present
      end
    end

    describe '#reevaluate_answer' do
      let!(:submission) { create(:submission, :published, assessment: assessment, creator: user) }

      # The normal case when the user checks his answer with the autograder.
      context 'when a programming answer is re-evaluated' do
        render_views
        let(:answer) { submission.answers.third } # programming answer
        subject do
          post :reevaluate_answer, params: {
            course_id: course, assessment_id: assessment.id,
            id: submission.id, answer_id: answer.id, format: :json
          }
        end

        it 'returns the answer' do
          subject
          wait_for_job

          is_expected.to have_http_status(:ok)
          json_result = JSON.parse(response.body)
          expect(json_result['jobUrl']).not_to be(nil)
        end
      end
    end

    describe '#reload_answer' do
      let!(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }

      context 'when answer_id does not exist' do
        subject do
          post :reload_answer, params: {
            course_id: course, assessment_id: assessment.id,
            id: submission.id, answer_id: -1, format: :json
          }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      # The normal case when the user checks his answer with the autograder.
      context 'when answer_id exists' do
        render_views
        let(:answer) { submission.answers.first }
        subject do
          post :reload_answer, params: {
            course_id: course, assessment_id: assessment.id,
            id: submission.id, answer_id: answer.id, format: :json
          }
        end

        it 'returns the answer' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['questionId']).to eq answer.question.id
        end
      end
    end

    describe '#generate_live_feedback' do
      let!(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
      let!(:answer) { submission.answers.where(actable_type: 'Course::Assessment::Answer::Programming').first }
      let!(:question) { answer.question }
      let!(:submission_question) do
        Course::Assessment::SubmissionQuestion.create!(submission_id: submission.id, question_id: question.id)
      end
      let!(:thread_id) { SecureRandom.hex(12) }
      let!(:thread_status) { 'active' }
      let!(:message) { 'This is a message' }
      let!(:option_id) { 2 }
      let!(:options) { [1, 2, 3] }

      context 'when the answer exists' do
        before do
          options.each do |_|
            Course::Assessment::LiveFeedback::Option.create!(option_type: 0, is_enabled: true)
          end
          Course::Assessment::LiveFeedback::Thread.create!({ codaveri_thread_id: thread_id,
                                                             submission_question: submission_question,
                                                             is_active: true,
                                                             submission_creator_id: submission.creator_id,
                                                             created_at: Time.zone.now })

          allow(answer).to receive(:generate_live_feedback).with(thread_id, message).and_return(:ok)
        end

        it 'generates live feedback' do
          post :generate_live_feedback, as: :json, params: {
            course_id: course, assessment_id: assessment, id: submission.id, answer_id: answer.id,
            thread_id: thread_id, message: message, option_id: option_id, options: options
          }

          expect(response).to have_http_status(:ok)
        end
      end
    end

    describe 'submission_actions' do
      let!(:students) { create_list(:course_student, 5, course: course) }
      let!(:phantom_student) { create(:course_student, :phantom, course: course) }
      let!(:submissions_hash) do
        {
          attempting: create(
            :submission, :attempting,
            assessment: assessment, course: course, creator: students[1].user
          ),
          submitted: create(
            :submission, :submitted,
            assessment: assessment, course: course, creator: students[0].user
          ),
          graded: create(
            :submission, :graded,
            assessment: assessment, course: course, creator: students[3].user
          ),
          published: create(
            :submission, :published,
            assessment: assessment, course: course, creator: students[2].user
          )
        }
      end

      describe '#publish_all' do
        subject do
          put :publish_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no graded submission' do
          before do
            submissions_hash[:graded].destroy!
          end
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there is a graded submission' do
          render_views
          it 'publishes the submission' do
            subject
            wait_for_job

            expect(submissions_hash[:graded].reload.published?).to be(true)
            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end
      end

      describe '#force_submit_all' do
        subject do
          put :force_submit_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: course_users, format: :json
          }
        end

        context 'when there is no attempting submission' do
          let!(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
          let(:course_users)  { 'staff' }
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there are empty and attempting submissions' do
          render_views
          let(:course_users) { 'students_w_phantom' }

          it 'publishes the submissions' do
            subject
            wait_for_job

            expect(assessment.submissions.count).to eq(6) # 5 normal students + 1 phantom student
            expect(assessment.submissions.pluck(:workflow_state)).not_to include 'attempting'

            expect(submissions_hash[:attempting].reload.draft_points_awarded).to eq(nil)
            expect(submissions_hash[:attempting].reload.points_awarded).to eq(0)

            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end

        context 'when the assessment has delayed grade publication setting' do
          render_views
          let(:assessment_traits) { [:with_all_question_types, :delay_grade_publication] }
          let(:course_users) { 'students_w_phantom' }

          it 'grades the submissions' do
            subject
            wait_for_job

            expect(assessment.submissions.count).to eq(6)
            expect(assessment.submissions.pluck(:workflow_state)).to include 'graded'
            expect(assessment.submissions.pluck(:workflow_state)).not_to include 'attempting'

            expect(submissions_hash[:attempting].reload.draft_points_awarded).to eq(0)
            expect(submissions_hash[:attempting].reload.points_awarded).to eq(nil)

            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end

        context 'when the assessment is autograded' do
          render_views
          let(:assessment_traits) { [:with_mrq_question, :autograded] }
          let(:course_users) { 'students_w_phantom' }

          it 'grades the submissions' do
            subject
            wait_for_job

            expect(assessment.submissions.count).to eq(6)
            expect(assessment.submissions.pluck(:workflow_state)).not_to include 'attempting'

            expect(submissions_hash[:attempting].reload.draft_points_awarded).to eq(nil)
            expect(submissions_hash[:attempting].reload.points_awarded).to eq(0)

            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end
      end

      describe '#unsubmit_all' do
        subject do
          put :unsubmit_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no submission' do
          let!(:submissions_hash) { nil }
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there is a submitted submission' do
          render_views
          it 'unsubmits the submission' do
            subject
            wait_for_job

            expect(submissions_hash[:submitted].reload.attempting?).to be(true)
            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end
      end

      describe '#delete_all' do
        subject do
          put :delete_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: course_users, format: :json
          }
        end

        context 'when there is no submission' do
          let(:course_users) { 'staff' }
          let!(:submissions_hash) { nil }
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there are some submissions' do
          render_views
          let(:course_users) { 'students' }
          it 'deletes all the submission' do
            subject
            wait_for_job

            expect(assessment.submissions.empty?).to be(true)
            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end
      end

      describe '#download_all' do
        let!(:download_format) { 'zip' }
        subject do
          put :download_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', download_format: download_format, format: :json
          }
        end

        context 'when there is no submission' do
          let!(:submissions_hash) { nil }
          it { expect(subject).to have_http_status(:bad_request) }
        end

        context 'when the download is requested in zip format' do
          render_views

          it 'downloads the submissions in zip format' do
            subject
            wait_for_job

            json_result = JSON.parse(response.body)
            job_guid = json_result['jobUrl'][(json_result['jobUrl'].rindex('/') + 1)..]
            job = TrackableJob::Job.find(job_guid)

            expect(job_guid).not_to be(nil)
            expect(response.header['Content-Type']).to include('application/json')
            expect(response.status).to eq(200)
            expect(job.redirect_to).to include('.zip')
          end
        end

        context 'when the download is requested in csv format' do
          render_views
          let!(:download_format) { 'csv' }

          it 'downloads the submission in csv format' do
            subject
            wait_for_job

            json_result = JSON.parse(response.body)
            job_guid = json_result['jobUrl'][(json_result['jobUrl'].rindex('/') + 1)..]
            job = TrackableJob::Job.find(job_guid)

            expect(job_guid).not_to be(nil)
            expect(response.header['Content-Type']).to include('application/json')
            expect(response.status).to eq(200)
            expect(job.redirect_to).to include('.csv')
          end
        end
      end

      describe '#download_statistics' do
        subject do
          put :download_statistics, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no submission' do
          let!(:submissions_hash) { nil }
          it { expect(subject).to have_http_status(:bad_request) }
        end

        context 'when there are submissions' do
          render_views

          it 'downloads the statistics' do
            subject
            wait_for_job

            json_result = JSON.parse(response.body)
            expect(json_result['jobUrl']).not_to be(nil)
          end
        end
      end
    end
  end
end
