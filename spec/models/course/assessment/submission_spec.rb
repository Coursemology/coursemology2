# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission do
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to have_many(:answers).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_answers).through(:answers) }
  it { is_expected.to have_many(:text_response_answers).through(:answers) }
  it { is_expected.to have_many(:programming_answers).through(:answers) }
  it { is_expected.to accept_nested_attributes_for(:answers) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [] }

    let(:user1) { create(:user) }
    let(:submission1) do
      create(:course_assessment_submission, *submission1_traits, assessment: assessment,
                                                                 creator: user1)
    end
    let(:submission1_traits) { [] }
    let(:user2) { create(:user) }
    let(:submission2) do
      create(:course_assessment_submission, *submission2_traits, assessment: assessment,
                                                                 creator: user2)
    end
    let(:submission2_traits) { [] }
    let(:user3) { create(:user) }
    let(:submission3) do
      create(:course_assessment_submission, *submission3_traits, assessment: assessment,
                                                                 creator: user3)
    end
    let(:submission3_traits) { [] }

    describe 'validations' do
      context 'when the course user is different from the submission creator' do
        let(:course_student) { create(:course_student, course: course) }
        subject do
          build(:submission, assessment: assessment, course_user: course_student, creator: user1)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:experience_points_record]).
            to include(I18n.
              t('activerecord.errors.models.course/assessment/submission.'\
                'attributes.experience_points_record.inconsistent_user'))
        end
      end
    end

    describe '.answers' do
      describe '.latest_answers' do
        context 'when the submission has multiple answers for the same question' do
          let(:assessment_traits) { [:with_mcq_question] }
          let(:submission1_traits) { :submitted }
          subject { submission1.answers.latest_answers }

          it 'only returns the latest answer' do
            submission1
            new_answer = create(:course_assessment_answer_multiple_response, :submitted,
                                assessment: assessment, question: assessment.questions.first,
                                submission: submission1, creator: user1).acting_as
            expect(subject).to contain_exactly(new_answer)
          end
        end
      end
    end

    describe '.by_user' do
      before do
        submission1
        submission2
      end

      it "only returns the selected user's submissions" do
        expect(assessment.submissions.by_user(user1).empty?).to be(false)
        expect(assessment.submissions.by_user(user1).
          all? { |submission| submission.course_user.user == user1 }).to be(true)
      end
    end

    describe '.by_users' do
      before do
        submission1
        submission2
      end

      it 'only returns the selected submissions by the provided user ids' do
        expect(assessment.submissions.by_users(user1.id)).to contain_exactly(submission1)
        expect(assessment.submissions.by_users([user1.id, user2.id])).
          to contain_exactly(submission1, submission2)
      end
    end

    describe '.from_category' do
      let(:new_category) { create(:course_assessment_category, course: course) }
      let(:new_tab) { create(:course_assessment_tab, course: course, category: new_category) }
      let(:new_assessment) { create(:course_assessment_assessment, course: course, tab: new_tab) }
      let(:new_submission) { create(:course_assessment_submission, assessment: new_assessment) }
      let!(:submissions) { [submission1, new_submission] }
      subject { Course::Assessment::Submission.from_category(new_category) }

      it 'returns submissions from assessments in this category' do
        expect(subject).to contain_exactly(new_submission)
      end
    end

    describe '.from_course' do
      let(:new_course) { create(:course) }
      let(:new_assessment) { create(:course_assessment_assessment, course: new_course) }
      let!(:new_submission) { create(:course_assessment_submission, assessment: new_assessment) }

      it 'returns submissions from assessments in the specified course' do
        submission1
        expect(Course::Assessment::Submission.from_course(course)).to contain_exactly(submission1)
        expect(Course::Assessment::Submission.from_course(new_course)).
          to contain_exactly(new_submission)
      end
    end

    describe '.ordered_by_date' do
      before do
        submission1
        submission2
      end

      it 'returns the submissions in the specified order' do
        expect(assessment.submissions.ordered_by_date.length).to be >= 2
        expect(assessment.submissions.ordered_by_date.each_cons(2).
          all? { |a, b| a.created_at >= b.created_at }).to be(true)
      end
    end

    describe '.ordered_by_submitted_date' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :submitted }
      let(:submission2_traits) { :submitted }
      before do
        submission1
        submission2
      end

      it 'returns the submissions in the descending order' do
        expect(assessment.submissions.ordered_by_submitted_date.length).to be >= 2
        expect(assessment.submissions.ordered_by_submitted_date.each_cons(2).
          all? { |a, b| a.submitted_at >= b.submitted_at }).to be(true)
      end
    end

    describe '.confirmed' do
      let(:submission1_traits) { :attempting }
      let(:submission2_traits) { :submitted }
      let(:submission3_traits) { :graded }
      let!(:submissions) { [submission1, submission2, submission3] }

      it 'returns the submissions with submitted or graded workflow state' do
        states = assessment.submissions.confirmed.map(&:workflow_state)
        expect(states).to contain_exactly('graded', 'submitted')
      end
    end

    describe '#grade' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :submitted }
      let(:submission) { submission1 }

      it 'sums the grade of all answers' do
        expect(submission.grade).to eq(submission.answers.map(&:grade).reduce(0, :+))
      end
    end

    describe '#graded_at' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :graded }
      let(:submission) { submission1 }

      it 'takes the maximum graded_at' do
        expect(submission.graded_at).to be_within(0.1).
          of(submission.answers.max_by(&:graded_at).graded_at)
      end
    end

    describe '#finalise!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission) { submission1 }

      before do
        submission.assessment.questions.attempt(submission).each(&:save!)
      end

      it 'propagates the finalise state to its answers' do
        expect(submission.answers.all?(&:attempting?)).to be(true)
        submission.finalise!
        expect(submission.answers.all?(&:submitted?)).to be(true)
      end

      with_active_job_queue_adapter(:test) do
        it 'creates a new auto grading job' do
          submission.finalise!
          expect { submission.save }.to \
            have_enqueued_job(Course::Assessment::Submission::AutoGradingJob).exactly(:once)
        end
      end

      context 'when one of the answers is finalised' do
        before do
          answer = submission.answers.sample
          answer.finalise!
          answer.save!
        end

        it 'finalises the rest of the answers' do
          expect(submission.answers.all?(&:submitted?)).to be(false)
          submission.finalise!
          expect(submission.answers.all?(&:submitted?)).to be(true)
        end
      end
    end

    describe '#publish!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission) { submission1 }
      let(:submission1_traits) { :submitted }

      it 'propagates the graded state to its answers' do
        expect(submission.answers.all?(&:submitted?)).to be(true)
        submission.publish!
        expect(submission.answers.all?(&:graded?)).to be(true)
      end

      context 'when some of the answers are already graded' do
        before do
          submission.answers.sample.tap do |answer|
            answer.publish!
            answer.save!
          end

          expect(submission.answers.any?(&:graded?)).to be(true)
        end

        it 'propagates the graded state to its answers' do
          submission.publish!
          expect(submission.answers.all?(&:graded?)).to be(true)
        end
      end
    end

    describe '#auto_grade!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :submitted }
      let(:submission) { submission1 }

      it 'returns an ActiveJob' do
        expect(submission.auto_grade!).to be_a(ActiveJob::Base)
      end

      with_active_job_queue_adapter(:test) do
        it 'queues the job' do
          submission
          expect { submission.auto_grade! }.to \
            have_enqueued_job(Course::Assessment::Submission::AutoGradingJob).exactly(:once)
        end
      end
    end

    describe '#unsubmit!' do
      let(:assessment_traits) { [:with_all_question_types] }
      subject { submission1 }
      before do
        subject.unsubmit!
        subject.save!
        subject.reload
      end

      context 'when the submission is submitted' do
        let(:submission1_traits) { :submitted }

        it 'resets the experience points awarded' do
          expect(subject.points_awarded).to be_nil
        end

        it 'sets all latest answers in the submission to attempting' do
          expect(subject.answers.latest_answers.all?(&:attempting?)).to be(true)
        end
      end

      context 'when the submission is graded' do
        let(:submission1_traits) { :graded }

        it 'resets the experience points awarded' do
          expect(subject.points_awarded).to be_nil
        end

        it 'sets all latest answers in the submission to attempting' do
          expect(subject.answers.latest_answers.all?(&:attempting?)).to be(true)
        end
      end
    end
  end
end
