# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ReducePriorityAutoGradingJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::Answer::ReducePriorityAutoGradingJob }
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, :autograded, course: course)
    end
    let(:question) { assessment.questions.first }
    let(:submission) { create(:submission, :published, assessment: assessment, creator: student_user) }
    let(:answer) { submission.answers.first }
    let!(:auto_grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

    it 'can be queued' do
      expect { subject.perform_later(answer) }.to \
        have_enqueued_job(subject).exactly(:once).on_queue('medium_high')
    end

    context 'When a question is not of highest grading priority' do
      before do
        question.update!(is_low_priority: true)
        answer.reload
      end

      it 'can be queued with delayed_ queue' do
        expect { subject.perform_later(answer) }.to \
          have_enqueued_job(subject).exactly(:once).on_queue('delayed_medium_high')
      end
    end

    context 'when the initial wrong answer is re-evaluated' do
      before do
        submission.update!(awarder: User.system)
      end

      it 'evaluates answers and updates the exp' do
        initial_points = submission.points_awarded

        subject.perform_now(answer)
        expect(answer).to be_graded
        expect(answer.grade).to eq(0)
        expect(submission.points_awarded).to eq(0)
        expect(submission.points_awarded).not_to eq(initial_points)
      end
    end

    context 'when the initial wrong answer is changed to correct one and re-evaluated' do
      before do
        question = answer.question.actable
        correct_options = question.options.select(&:correct)
        correct_options.each { |option| answer.actable.options << option }
        answer.save!
        submission.update!(awarder: User.system)
      end

      it 'evaluates answers and updates the exp' do
        initial_points = submission.points_awarded

        subject.perform_now(answer)
        expect(answer).to be_graded
        expect(answer.grade).to eq(question.maximum_grade)
        correct_exp = assessment.base_exp + assessment.time_bonus_exp
        expect(submission.points_awarded).to eq(correct_exp)
        expect(submission.points_awarded).not_to eq(initial_points)
      end
    end
  end
end
