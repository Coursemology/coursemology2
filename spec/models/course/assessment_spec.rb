require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(:lesson_plan_item) }
  it { is_expected.to belong_to(:tab) }
  it { is_expected.to have_many(:questions).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_questions).through(:questions) }
  it { is_expected.to have_many(:submissions).dependent(:destroy) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.questions' do
      describe '#attempt' do
        let(:assessment) do
          assessment = build(:assessment)
          create_list(:course_assessment_question_multiple_response, 3, assessment: assessment)
          assessment
        end
        let(:submission) { create(:course_assessment_submission, assessment: assessment) }
        let(:answers) { assessment.questions.attempt(submission) }

        context 'when some questions are being attempted' do
          before do
            assessment.questions.limit(1).attempt(submission).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'instantiates new answers' do
            expect(answers.first.persisted?).to be(true)
            expect(answers.drop(1).any?(&:persisted?)).to be(false)
          end
        end

        context 'when all questions are being attempted' do
          before do
            assessment.questions.attempt(submission).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'reuses all existing answers' do
            expect(answers.all?(&:persisted?)).to be(true)
          end
        end

        context 'when some questions have been submitted' do
          before do
            assessment.questions.limit(1).attempt(submission).tap do |answers|
              answers.each(&:save!)
              answers.each(&:submit!)
            end
          end

          it 'creates a new answer' do
            expect(answers.all?(&:persisted?)).to be(false)
          end
        end
      end
    end

    describe '.with_submissions_by' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:user1) { create(:user) }
      let(:submission1) { create(:submission, assessment: assessment, user: user1) }
      let(:user2) { create(:user) }
      let(:submission2) { create(:submission, assessment: assessment, user: user2) }
      let(:submission3) { create(:submission, assessment: assessment, user: user2) }

      it 'returns all assessments' do
        assessment
        expect(course.assessments.with_submissions_by(user1)).to contain_exactly(assessment)
      end

      it "preloads the specified user's submissions" do
        submission1
        submission2

        assessments = course.assessments.with_submissions_by(user1)
        expect(assessments.all? { |assessment| assessment.submissions.loaded? }).to be(true)
        submissions = assessments.flat_map { |assessment| assessment.submissions }
        expect(submissions.all? { |submission| submission.course_user.user == user1 }).to be(true)
      end

      it 'returns submissions in reverse chronological order' do
        submission2
        submission3

        assessment = course.assessments.with_submissions_by(user2).first
        submissions = assessment.submissions
        expect(submissions).to contain_exactly(submission2, submission3)
        expect(submissions.each_cons(2).all? { |a, b| a.created_at >= b.created_at }).to be(true)
      end
    end
  end
end
