# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AnswersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :published) }
    let(:course_student) { create(:course_student, course: course) }
    let(:assessment) { create(:assessment, :published, :with_all_question_types, course: course) }
    let(:submission) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: course_student.user)
    end
    let!(:answer) { submission.answers.first }
    let!(:submission_question) do
      create(:submission_question, :with_post, submission_id: answer.submission_id, question_id: answer.question_id)
    end

    describe '#question_answer_details' do
      render_views
      subject { get :question_answer_details, as: :json, params: { course_id: course, id: answer.id } }

      context 'when the Normal User get the question answer details' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student get the question answer details' do
        let(:user) { course_student.user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager get the question answer details' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }

        it 'returns OK with right number of answers and comments' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end

      context 'when the Course Teaching Assistant get the question answer details' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }

        it 'returns OK with right number of answers and comments' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end
    end

    describe '#all_answers' do
      render_views
      subject { get :all_answers, as: :json, params: { course_id: course, id: submission_question.id } }

      context 'when the Normal User get the question answer details' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student get the question answer details' do
        let(:user) { course_student.user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager get the question answer details' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }

        it 'returns OK with right number of answers and comments' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # expect only one allAnswers
          expect(json_result['allAnswers'].count).to eq(1)

          # expect only one comment
          expect(json_result['comments'].count).to eq(1)
        end
      end

      context 'when the Course Teaching Assistant get the question answer details' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }

        it 'returns OK with right number of answers and comments' do
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
