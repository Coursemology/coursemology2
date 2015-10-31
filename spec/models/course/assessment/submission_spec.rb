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
    let(:submission1) do
      create(:submission, *submission1_traits, assessment: assessment, user: user1)
    end
    let(:submission1_traits) { [] }
    let(:user2) { create(:user) }
    let(:submission2) do
      create(:submission, *submission2_traits, assessment: assessment, user: user2)
    end
    let(:submission2_traits) { [] }

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
    end
  end
end
