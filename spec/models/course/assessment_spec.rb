require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(:lesson_plan_item) }
  it { is_expected.to belong_to(:tab) }
  it { is_expected.to have_many(:questions).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_questions).through(:questions) }
  it { is_expected.to have_many(:text_response_questions).through(:questions) }
  it { is_expected.to have_many(:submissions).dependent(:destroy) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [] }

    it 'sets the course of the lesson plan item' do
      assessment = create(:assessment, course: course)
      expect(assessment.course).to eq(assessment.tab.category.course)
    end

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
              answers.each(&:finalise!)
            end
          end

          it 'creates a new answer' do
            expect(answers.all?(&:persisted?)).to be(false)
          end
        end
      end
    end

    describe '.with_maximum_grade' do
      let(:assessment_traits) { [:with_all_question_types] }

      it 'includes the maximum grade' do
        maximum_grade = self.assessment.questions.map(&:maximum_grade).reduce(0, :+)

        assessment = Course::Assessment.with_maximum_grade.find(self.assessment.id)
        expect(assessment.maximum_grade).to eq(maximum_grade)
      end
    end

    describe '.with_submissions_by' do
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

    context 'after assessment was initialized' do
      subject { build(:assessment) }

      it 'builds a folder' do
        expect(subject.folder).to be_present

        expect(subject).to be_valid
        expect(subject.folder.name).to eq(subject.title)
        expect(subject.folder.parent).to eq(subject.tab.category.folder)
        expect(subject.folder.course).to eq(subject.course)
        expect(subject.folder.start_at).to eq(subject.start_at)
      end
    end

    describe 'after assessment was changed' do
      subject { create(:assessment) }

      it 'updates the folder' do
        new_title = 'Whole new assessment'
        new_start_at = 1.day.ago

        subject.title = new_title
        subject.start_at = new_start_at
        subject.save

        expect(subject.folder.name).to eq(new_title)
        expect(subject.folder.start_at).to eq(new_start_at)
      end
    end
  end
end
