require 'rails_helper'

RSpec.describe Course::Assessment::Submission do
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to have_many(:answers) }
  it { is_expected.to accept_nested_attributes_for(:answers) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [] }

    let(:user1) { create(:user) }
    let(:submission1) { create(:submission, assessment: assessment, user: user1) }
    let(:user2) { create(:user) }
    let(:submission2) { create(:submission, assessment: assessment, user: user2) }

    describe '.with_grade' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission) { submission1 }

      before do
        submission.assessment.questions.attempt(submission).each(&:save!)
        submission.reload
      end

      it 'includes the grade of the answers' do
        grades = []
        self.submission.answers.each do |answer|
          answer.finalise!
          grade = Random::DEFAULT.rand(answer.question.maximum_grade)
          grades << grade
          answer.grade!
          answer.grade = grade
          answer.save
        end

        submission_grade = grades.reduce(0, :+)
        submission = Course::Assessment::Submission.with_grade.find(self.submission.id)
        expect(submission.grade).to eq(submission_grade)
      end
    end

    describe '.with_creator' do
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
    end
  end
end
