# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to belong_to(:tab) }
  it { is_expected.to have_many(:questions).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_questions).through(:questions) }
  it { is_expected.to have_many(:text_response_questions).through(:questions) }
  it { is_expected.to have_many(:programming_questions).through(:questions) }
  it { is_expected.to have_many(:submissions).dependent(:destroy) }
  it { is_expected.to have_many(:conditions) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [] }

    describe 'callbacks' do
      describe 'after assessment was initialized' do
        subject { build(:assessment) }

        it 'sets the course of the lesson plan item' do
          assessment = create(:assessment, course: course)
          expect(assessment.course).to eq(assessment.tab.category.course)
        end
      end

      describe 'after assessment was saved' do
        subject { create(:assessment) }

        it 'sets the folder to have the same attributes as the assessment' do
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

    describe '.questions' do
      describe '#attempt' do
        let(:assessment) do
          assessment = build(:assessment)
          create_list(:course_assessment_question_multiple_response, 3, assessment: assessment)
          create_list(:course_assessment_question_text_response, 3, assessment: assessment)
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
            expect(answers.count(&:persisted?)).to eq(1)
            expect(answers.count(&:new_record?)).to eq(assessment.questions.length - 1)
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
              answers.each(&:finalise!)
              answers.each(&:save!)
            end
          end

          it 'creates a new answer' do
            expect(answers.all?(&:persisted?)).to be(false)
          end
        end
      end

      describe '#step' do
        let(:assessment_traits) { [:with_all_question_types] }
        let(:submission) { create(:course_assessment_submission, assessment: assessment) }

        context 'when no question is answered' do
          it 'returns the first question' do
            expect(assessment.questions.step(submission, 2)).
              to contain_exactly(assessment.questions.first)

            expect(assessment.questions.step(submission, -1)).
              to contain_exactly(assessment.questions.first)
          end
        end

        context 'when the first question is answered' do
          before do
            answer = assessment.questions.first.attempt(submission)
            answer.correct = true
            answer.save
          end

          context 'when index is inaccessible' do
            it 'returns the first unanswered question' do
              expect(assessment.questions.step(submission, 1)).
                to contain_exactly(assessment.questions.second)
            end
          end

          context 'when index is less than 0' do
            it 'returns the first question' do
              expect(assessment.questions.step(submission, -1)).
                to contain_exactly(assessment.questions.first)
            end
          end

          context 'when index is accessible' do
            it 'returns the question at given index' do
              expect(assessment.questions.step(submission, 0)).
                to contain_exactly(assessment.questions.first)
            end
          end
        end
      end

      describe '#next_unanswered' do
        let(:assessment_traits) { [:with_all_question_types] }
        let(:submission) { create(:course_assessment_submission, assessment: assessment) }

        subject { assessment.questions.next_unanswered(submission) }
        context 'when there is no answers' do
          it { is_expected.to eq(assessment.questions.first) }
        end

        context 'when the first question is answered correctly' do
          before do
            answer = assessment.questions.first.attempt(submission)
            answer.correct = true
            answer.save
          end

          it { is_expected.to eq(assessment.questions.second) }
        end

        context 'when all questions have been answered correctly' do
          before do
            assessment.questions.attempt(submission).each do |answer|
              answer.correct = true
              answer.save
            end
          end

          it { is_expected.to be_nil }
        end
      end
    end

    describe '#maximum_grade' do
      context 'when it has questions' do
        let(:assessment_traits) { [:with_all_question_types] }

        it 'returns the maximum grade' do
          maximum_grade = self.assessment.questions.map(&:maximum_grade).reduce(0, :+)

          expect(assessment.maximum_grade).to eq(maximum_grade)
        end
      end

      context 'when it does not have any question' do
        it 'returns 0' do
          expect(assessment.maximum_grade).to eq(0)
        end
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
        submissions = assessments.flat_map(&:submissions)
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

    context 'when there is a name conflict with other assessment in the same category' do
      let(:common_title) { 'Mission Impossible' }
      let!(:tab) { create(:assessment, title: common_title).tab }

      context 'after assessment was saved' do
        subject { build(:assessment, title: common_title, tab: tab) }
        it 'create a folder with proper name' do
          subject.save

          expect(subject.folder.name).to eq(common_title + ' (0)')
        end
      end

      context 'after assessment was changed' do
        subject { create(:assessment, title: common_title, tab: tab) }

        it 'updates the folder with proper name' do
          subject.title = common_title
          subject.save

          expect(subject.folder.name).to eq(common_title + ' (0)')
        end
      end
    end
  end
end
