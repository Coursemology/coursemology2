# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AnswersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:course_user) { create(:course_user, course: course) }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, course: course, start_at: 1.day.from_now)
    end
    let(:submission) { create(:submission, :graded, assessment: assessment, creator: course_user.user) }
    let(:answer) { submission.answers.first }
    let!(:submission_question) do
      create(:submission_question, :with_post, submission_id: answer.submission_id, question_id: answer.question_id)
    end

    describe '#question_answer_details' do
      render_views
      subject { get :question_answer_details, format: :json, params: { course_id: course, id: answer.id } }

      context 'when the Normal User get the question answer details for the statistics' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student get the question answer details for the statistics' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager get the question answer details for the statistics' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns OK with right question id and answer grade being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          expect(json_result['question']['id']).to eq(answer.question.id)
          expect(json_result['answer']['grade'].to_f).to eq(answer.grade)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end

      context 'when the administrator get the question answer details for the statistics' do
        let(:administrator) { create(:administrator) }
        before { controller_sign_in(controller, administrator) }

        it 'returns OK with right question id and answer grade being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          expect(json_result['question']['id']).to eq(answer.question.id)
          expect(json_result['answer']['grade'].to_f).to eq(answer.grade)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end
    end

    describe '#all_answers' do
      render_views
      subject { get :all_answers, format: :json, params: { course_id: course, id: submission_question.id } }

      context 'when the Normal User get the question answer details for the statistics' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student get the question answer details for the statistics' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager get the question answer details for the statistics' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns OK with right question id and answer grade being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end

      context 'when the administrator get the question answer details for the statistics' do
        let(:administrator) { create(:administrator) }
        before { controller_sign_in(controller, administrator) }

        it 'returns OK with right question id and answer grade being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end
    end
  end
end
