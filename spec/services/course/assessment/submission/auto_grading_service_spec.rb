# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::AutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
    let(:answer) do
      create(:course_assessment_answer_multiple_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end

    describe '#grade' do
      it 'evaluates all answers' do
        answer
        expect(subject.grade(submission)).to eq(true)

        expect(submission.answers.map(&:reload).all?(&:evaluated?)).to be(true)
        expect(submission.answers.map(&:reload).map(&:grade).all?(&:nil?)).to be(true)
      end

      context 'when the submission has an answer in the attempting state' do
        let(:answer) do
          create(:course_assessment_answer_multiple_response,
                 question: question.acting_as, submission: submission).answer
        end

        it 'submits and grades the answer' do
          answer
          expect(subject.grade(submission)).to eq(true)

          expect(answer.reload.evaluated?).to be_truthy
          expect(submission.answers.map(&:reload).all?(&:evaluated?)).to be(true)
        end
      end

      context 'when given a non-auto gradable answer' do
        let(:non_autograded_question) do
          create(:course_assessment_question_programming, assessment: assessment)
        end
        let!(:answer) do
          create(:course_assessment_answer_programming, :submitted,
                 question: non_autograded_question.acting_as, submission: submission).answer
        end
        it 'evaluates the answer' do
          answer
          expect(subject.grade(submission)).to eq(true)

          gradable_answers = submission.answers.reject { |answer| answer.question.auto_gradable? }
          expect(gradable_answers).not_to be_empty
          expect(gradable_answers.map(&:reload).all?(&:evaluated?)).to be(true)
        end
      end

      context 'when assessment is autograded' do
        let(:start_at) { 5.days.ago }
        let(:bonus_end_at) { 3.days.ago }
        let(:end_at) { 1.day.ago }
        let(:assessment) do
          create(:assessment, :published_with_mcq_question, :autograded,
                 course: course, question_count: 2, start_at: start_at, bonus_end_at: bonus_end_at,
                 end_at: end_at)
        end
        let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
        let!(:correct_answer) do
          create(:course_assessment_answer_multiple_response, :with_all_correct_options,
                 question: assessment.questions.first,
                 submission: submission)
        end
        let!(:wrong_answer) do
          create(:course_assessment_answer_multiple_response, :with_all_wrong_options,
                 question: assessment.questions.last,
                 submission: submission)
        end
        before do
          # Stub #auto_grade_submission so that job is not created upon save
          allow(submission).to receive(:auto_grade_submission).and_return(true)
          submission.finalise!
          submission.save!
        end

        it 'grades all answers' do
          subject.grade(submission)
          expect(submission.answers.map(&:reload).all?(&:graded?)).to be(true)
        end

        it 'pubishes the submission' do
          subject.grade(submission)
          expect(submission).to be_published
        end

        context 'when submission is submitted before bonus end at' do
          before do
            submission.update_column(:submitted_at, 4.days.ago)
            subject.grade(submission)
          end

          it 'gives the correct experience points' do
            correct_exp = (assessment.time_bonus_exp + assessment.base_exp).to_f / 2
            expect(submission.points_awarded).to eq(correct_exp.to_i)
          end
        end

        context 'when submission is submitted between bonus end at and end at' do
          before do
            submission.update_column(:submitted_at, 2.days.ago)
            subject.grade(submission)
          end

          it 'gives the correct experience points' do
            correct_exp = assessment.base_exp.to_f / 2
            expect(submission.points_awarded).to eq(correct_exp.to_i)
          end
        end

        context 'when submission is submitted after end at' do
          before do
            submission.answers.each do |answer|
              answer.update_column(:submitted_at, Time.zone.now)
            end
            subject.grade(submission)
          end

          it 'gives 0 experience points' do
            expect(submission.points_awarded).to eq(0)
          end
        end
      end
    end

    context 'when a sub job fails' do
      before do
        def subject.aggregate_failures(jobs)
          jobs.each_with_index do |job, i|
            job.status = :errored
            job.error = { 'message' => i }
          end

          super
        end
      end

      it 'fails with a SubJobError' do
        answer
        allow(subject).to receive(:ungraded_answers).and_return([answer])
        allow(answer).to receive(:grade_inline?).and_return(false)

        expect { subject.grade(submission) }.to \
          raise_error(Course::Assessment::Submission::AutoGradingService::SubJobError, '0')
      end
    end
  end
end
