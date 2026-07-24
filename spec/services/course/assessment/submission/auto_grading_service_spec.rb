# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::AutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment, creator: student_user)
    end

    describe '#grade' do
      it 'evaluates the current_answers' do
        submission.finalise!
        submission.save!
        expect(subject.grade(submission)).to eq(true)

        expect(submission.answers.map(&:reload).all?(&:evaluated?)).to be(true)
        expect(submission.answers.map(&:reload).map(&:grade).all?(&:nil?)).to be(true)
      end

      context 'when the submission has a current answer in the attempting state' do
        it 'submits and grades the answer' do
          current_answer = submission.answers.find do |ans|
            ans.current_answer && ans.workflow_state == 'attempting'
          end
          expect(subject.grade(submission)).to eq(true)

          expect(current_answer.reload.evaluated?).to be_truthy
          expect(submission.answers.map(&:reload).all?(&:evaluated?)).to be(true)
        end
      end

      context 'when given a non-auto gradable answer' do
        let(:non_autograded_question) do
          create(:course_assessment_question_programming, assessment: assessment)
        end
        let!(:answer) do
          create(:course_assessment_answer_programming, :submitted, current_answer: true,
                                                                    question: non_autograded_question.acting_as,
                                                                    submission: submission).answer
        end
        it 'evaluates the answer' do
          expect(subject.grade(submission)).to eq(true)

          gradable_answers = submission.current_answers.reject { |answer| answer.question.auto_gradable? }
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
                 current_answer: true,
                 question: assessment.questions.first,
                 submission: submission)
        end
        let!(:wrong_answer) do
          create(:course_assessment_answer_multiple_response, :with_all_wrong_options,
                 current_answer: true,
                 question: assessment.questions.last,
                 submission: submission)
        end
        before do
          # Stub #auto_grade_submission so that job is not created upon save. It is an after_save
          # callback on the Attempt base (where the workflow lives), so stub it there.
          allow(submission.attempt).to receive(:auto_grade_submission).and_return(true)
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
            submission.attempt.update_column(:submitted_at, 4.days.ago)
            subject.grade(submission)
          end

          it 'gives the correct experience points' do
            correct_exp = (assessment.time_bonus_exp + assessment.base_exp).to_f / 2
            expect(submission.points_awarded).to eq(correct_exp.to_i)
          end
        end

        context 'when submission is submitted between bonus end at and end at' do
          before do
            submission.attempt.update_column(:submitted_at, 2.days.ago)
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

    # Post-split, production drives this service with the ATTEMPT base (the after_save trigger passes
    # `self`), not the Submission extension. These examples pin that path — the one the existing
    # `context 'when assessment is autograded'` masks by hand-passing a Submission.
    describe '#grade driven by the Attempt base (production path)' do
      let(:autograded_assessment) do
        create(:assessment, :published_with_mcq_question, :autograded, course: course, question_count: 2)
      end

      it 'awards EXP on the extension and publishes for a REAL autograded submission' do
        submission = create(:submission, :attempting, assessment: autograded_assessment, creator: student_user)
        # Suppress the async after_save re-trigger so we exercise grade() directly (mirrors the existing
        # autograded context). The stub is on the Attempt base, where the callback lives.
        allow(submission.attempt).to receive(:auto_grade_submission).and_return(true)
        submission.finalise!
        submission.save!

        expect { subject.grade(submission.attempt) }.not_to raise_error

        submission.reload
        expect(submission).to be_published
        expect(submission.points_awarded).not_to be_nil
      end

      it 'grades and publishes a PREVIEW attempt (no extension) WITHOUT awarding EXP, no crash' do
        previewer = create(:course_manager, course: course).user
        preview = create(:course_assessment_attempt, assessment: autograded_assessment, creator: previewer)
        allow(preview).to receive(:auto_grade_submission).and_return(true)
        preview.create_new_answers
        preview.finalise!
        preview.save!
        expect(preview.submission).to be_nil # it is a preview: no Submission extension row

        expect { subject.grade(preview) }.not_to raise_error

        preview.reload
        expect(preview).to be_published
        expect(preview.submission).to be_nil
        expect(preview.current_answers.map(&:reload)).to all(be_graded.or(be_evaluated))
      end
    end

    context 'when a sub job fails' do
      let(:answer) do
        create(:course_assessment_answer_multiple_response, :submitted,
               question: question.acting_as, submission: submission).answer
      end

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

        expect do
          subject.grade(submission)
          wait_for_job
        end.to raise_error(Course::Assessment::Submission::AutoGradingService::SubJobError, '0')
      end
    end
  end
end
