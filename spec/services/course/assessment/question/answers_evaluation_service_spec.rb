# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::AnswersEvaluationService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    # Used MCQ question here because we are not able to run programming auto grading in tests
    let(:assessment) { create(:assessment, :with_mcq_question) }
    let(:question) { create(:course_assessment_question_multiple_response, assessment: assessment) }
    let(:student) { create(:course_student, course: assessment.course).user }
    let!(:submission) do
      create(:submission, :submitted, assessment: assessment, creator: student)
    end
    let!(:answers) { submission.answers }
    subject { Course::Assessment::Question::AnswersEvaluationService.new(question) }

    describe '#call' do
      before { subject.call }

      it 'auto grades the associated answers' do
        wait_for_job
        answers.each(&:reload)
        expect(answers.all?(&:evaluated?)).to be_truthy
      end
    end

    # Only answers whose grading is shown outside a submission's past answers are regraded: what the submission
    # edit page shows (SubmissionsHelper#last_attempt) and the statistics' "last attempt".
    describe 'which answers are regraded' do
      let!(:question) { create(:course_assessment_question_multiple_response, assessment: assessment) }
      # Its own student and submission: the outer `submission` was created before this question existed, and
      # loaded `assessment.questions` -- hence the reload when creating these.
      let(:other_student) { create(:course_student, course: assessment.course).user }
      let(:regraded_answer_ids) { [] }

      before do
        regraded = regraded_answer_ids
        allow_any_instance_of(Course::Assessment::Answer).to receive(:auto_grade!) do |answer, **|
          regraded << answer.id
        end
      end

      def create_student_submission(workflow_state)
        create(:submission, workflow_state, assessment: assessment.reload, creator: other_student)
      end

      def add_attempt(to_submission, created_at:, current: false)
        question.attempt(to_submission).tap do |answer|
          answer.current_answer = current
          answer.created_at = created_at
          answer.finalise!
          answer.save!
        end
      end

      def current_answer_of(of_submission)
        of_submission.answers.where(question: question.acting_as).current_answers.sole
      end

      # Only what the service regrades: creating a submitted submission grades its answers through auto_grade! too.
      def answers_regraded_by_call
        regraded_answer_ids.clear
        subject.call
        regraded_answer_ids
      end

      context 'when the submission is being attempted' do
        let(:student_submission) { create_student_submission(:attempting) }
        let!(:older_attempt) { add_attempt(student_submission, created_at: 2.days.ago) }
        let!(:newest_attempt) { add_attempt(student_submission, created_at: 1.day.ago) }

        it 'regrades only the newest submitted attempt, which the edit page shows' do
          expect(current_answer_of(student_submission)).to be_attempting
          expect(answers_regraded_by_call).to contain_exactly(newest_attempt.id)
        end
      end

      context 'when the submission has been submitted' do
        let(:student_submission) { create_student_submission(:submitted) }
        let!(:older_attempt) { add_attempt(student_submission, created_at: 1.day.ago) }

        it 'regrades only the current answer, which the edit page shows' do
          expect(answers_regraded_by_call).to contain_exactly(current_answer_of(student_submission).id)
        end
      end

      # Finalising normally makes the current answer the newest, but where it is not, the edit page shows the
      # current answer and the statistics the newest one, so both are regraded.
      context 'when a submitted submission has an attempt newer than its current answer' do
        let(:student_submission) { create_student_submission(:submitted) }
        let!(:newer_attempt) { add_attempt(student_submission, created_at: 1.day.from_now) }

        it 'regrades both' do
          expect(answers_regraded_by_call).
            to contain_exactly(current_answer_of(student_submission).id, newer_attempt.id)
        end
      end
    end
  end
end
